---
title: Nitty Gritties of Posting using the Bluesky API
summary: The Bluesky "post" record type has many features, including replies, quote-posts, embedded social cards, mentions, and images. This blog post gives example code for all the common post formats.
date: Aug 7, 2023
---

The most obvious thing a developer would want to do with atproto is posting to Bluesky. Once you [have an account](/blog/call-for-developers), the basics are pretty simple, like two-line HTTPie CLI example shows:

```sh
export AUTH_TOKEN=`http post https://pds.staging.bsky.dev/xrpc/com.atproto.server.createSession \
        identifier="$BLUESKY_HANDLE" \
        password="$BLUESKY_APP_PASSWORD" \
    | jq .accessJwt -r`
http post https://pds.staging.bsky.dev/xrpc/com.atproto.repo.createRecord \
    Authorization:"Bearer $AUTH_TOKEN" \
    repo=$BLUESKY_HANDLE \
    collection=app.bsky.feed.post \
    record:="{\"text\": \"quick and dirty post\", \"createdAt\": \"`date --iso-8601=second --utc`\"}"
```

The devil is in the details of more complex posts: reply threads, extracting mentions, quote posts, embeding images or website cards, etc. The official Bluesky Social app is open source ([github repo here](https://github.com/bluesky-social/social-app)), and there are API clients and SDKs for a handful of programming languages. But the post record type is both central enough and complex enough that working through all the features and options is worthwhile.

We've chose Python as the example language because it fairly readable and distinct from the two primary languages we already publish code in (Javascript/Typescript and Go). You can get a copy of the full script from [this Github Gist](https://gist.github.com/bnewbold/ebc172c927b6a64d536bdf46bd5c2925). It was tested with Python 3.11, with the `requests` and `bs4` (BeautifulSoup) packages installed.

This blog post is a snapshot in time and may get out of date as new features are added to atproto and the Bluesky application schemas. The source of truth for the application API is the Lexicons themselves (currently [versioned on Github](https://github.com/bluesky-social/atproto/tree/main/lexicons)). The overall protocol is described at [atproto.com](https://atproto.com).


## Authentication and Post Record Structure

Creating post requires authentication, so the first step is to create a new session by connecting to the Bluesky service using an account handle and [app password](https://atproto.com/specs/xrpc#app-passwords). The service URL to connect to depends on the hosting provider; Bluesky's primary PDS service is at `https://bsky.social/`.

The `com.atproto.server.createSession` API endpoint returns a session object containing two API tokens: and "access token" (`accessJwt`) which is used to authenticate requests but expires after a few minutes, and a "refresh token" (`refreshJwt`) which lasts longer and is used only to update the session with a new access token. For our purposes, making a single post, we can get away with a single session and not bother with refreshing.

```python
import requests

BLUESKY_HANDLE = "you.example.com"
BLUESKY_APP_PASSWORD = "123-456-789"

resp = requests.post(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    json={"identifier": BLUESKY_HANDLE, "password": BLUESKY_APP_PASSWORD},
)
resp.raise_for_status()
session = resp.json()
print(session["accessJwt"]
```

Now we can create a simple post. Bluesky posts are repository records with the Lexicon type `app.bsky.feed.post`. The required fields are `text` and `createdAt` (a timestamp). The `$type` field should also be included in every record, though the server will fill this in based on the collection indicated in the `createRecord` request body if it isn't included.

The `com.atproto.repo.createRecord` endpoint is used to actually create records in the repository. For some record types it is important to supply the "record key" (`rkey`), which is like a filename for the record, but for posts it is best to let the server create one automatically.

```python
from datetime import datetime, timezone

# trailing "Z" is preferred over "+00:00"
now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

# these are the required fields which every post must include
post = {
    "$type": "app.bsky.feed.post",
    "text": "Hello World!",
    "createdAt": now,
}

resp = requests.post(
    "https://bsky.social/xrpc/com.atproto.repo.createRecord",
    headers={"Authorization": "Bearer " + session["accessJwt"]},
    json={
        "repo": session["did"],
        "collection": "app.bsky.feed.post",
        "record": post,
    },
)
print(json.dumps(resp.json(), indent=2))
resp.raise_for_status()
```

Here is what a basic post record should look like, as a JSON object:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "Hello World!",
  "createdAt": "2023-08-07T05:31:12.156888Z"
}
```

The full reposistory path (including the auto-generated `rkey`) will be returned as a response to the `createRecord` request. It looks like:

```json
{
  "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k4duaz5vfs2b",
  "cid": "bafyreibjifzpqj6o6wcq3hejh7y4z4z2vmiklkvykc57tw3pcbx3kxifpm"
}
```


## Indicating Language

The (human) language of posts can be indicated with the `langs` field. which can be an array of strings in BCP-47 format. This is the same standard and format used by web browsers to encode language and localization context. If there are multiple languages present in the post, multiple values can be included. A common pattern is for accounts or clients to configure (or auto-detect) a set of languages and include those by default for every post, unless the user overrides the configuration on a per-post basis.

```python
# an example with Thai and English (US) languages
post["text"] = "สวัสดีชาวโลก!\nHello World!"
post["langs"] = ["th", "en-US"]
```

The resulting post record object looks like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35\u0e0a\u0e32\u0e27\u0e42\u0e25\u0e01!\\nHello World!",
  "createdAt": "2023-08-07T05:44:04.395087Z",
  "langs": [ "th", "en-US" ]
}
```

## Parsing Mentions and URLs

Mentions of other accounts (by handle) and URLs in posts are generally expected to look and act as hyperlinks. In the Bluesky system, responsibility for parsing these patterns and creating links (called "facets") is not handled automatically by the server, and falls to the client.

These links are encoded as "facets", which are external rich text annotations on top of the plain text string that is the post text itself. The syntax is to have a list of annotations, each of which reference a byte range within the string, along with annotation context. It is important to note that facet start and stop indicators are counted by UTF-8 bytes, not Unicode codepoints, graphemes, or grapheme clusters. Different programming languages will have different affordances for working with bytestrings and counting by bytes, instead of Unicode strings and counting by codepoints. In this Python example, we use regex matching over bytestrings directly (which is supported by the Python standard library).

The two patterns to check for are handle mentions (which look like `@you.example.com`) and HTTP/S URLs (like `https://atproto.com/index.html`). This example code uses naive regexes to find both patterns. For URLs in particular, the standard is relatively flexible, making detection of URLs in plain text somewhat ambiguous. This example code does try detect word boundaries and not include some training punctuation, but does not handle URL decoding or several other complexities.

```python
def parse_mentions(text: str) -> List[Dict]:
    spans = []
    # regex based on: https://atproto.com/specs/handle#handle-identifier-syntax
    mention_regex = rb"[$|\W](@([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)"
    text_bytes = text.encode("UTF-8")
    for m in re.finditer(mention_regex, text_bytes):
        spans.append({
            "start": m.start(1)
            "end": m.end(1),
            "handle": m.group(1)[1:].decode("UTF-8")
        })
    return spans

def parse_urls(text: str) -> List[Dict]:
    spans = []
    # partial/naive URL regex based on: https://stackoverflow.com/a/3809435
    # tweaked to disallow some training punctuation
    url_regex = rb"[$|\W](https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*[-a-zA-Z0-9@%_\+~#//=])?)"
    text_bytes = text.encode("UTF-8")
    for m in re.finditer(url_regex, text_bytes):
        spans.append({
            "start": m.start(1),
            "end": m.end(1),
            "url": m.group(1).decode("UTF-8")),
        })
    return spans
```

Once the facet segments have been parsed out, then need to be turned in to `app.bsky.richtext.facet` objects. Handles must be resolved to DIDs, which can be done server-side using the `com.atproto.identity.resolveHandle` endpoint.

The facet Lexicon schema allows both `app.bsky.richtext.facet#mention` and `app.bsky.richtext.facet#link` objects to appear in the `features` array of a facet. Because of this flexiblity, a `$type` field needs to be included in each object to disambiguate between the two.

```python
def parse_facets(text: str) -> List[Dict]:
    facets = []
    for m in parse_mentions(text):
        resp = requests.get(
            "https://bsky.social/xrpc/com.atproto.identity.resolveHandle",
            params={"handle": m["handle"]},
        )
        # if handle couldn't be resolved, just skip it! will be text in the post
        if resp.status_code == 400:
            continue
        did = resp.json()["did"]
        facets.append({
            "index": {
                "byteStart": m["start"],
                "byteEnd": m["end"],
            },
            "features": [{"$type": "app.bsky.richtext.facet#mention", "did": did}],
        })
    for u in parse_urls(text):
        facets.append({
            "index": {
                "byteStart": u["start"],
                "byteEnd": u["end"],
            },
            "features": [
                {
                    "$type": "app.bsky.richtext.facet#link",
                    # NOTE: URI ("I") not URL ("L")
                    "uri": u["url"],
                }
            ],
        })
    return facets
```

The list of facets gets attached to the `facets` field of the post record:

```python
post["text"] = "✨ example mentioning @bnewbold.staging.bsky.dev to share the URL 👨<200d>❤️<200d>👨 https://example.com/index.html."
post["facets"] = parse_facets(post["text"])
```

which results in an overall post record looking like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "\u2728 example mentioning @bnewbold.staging.bsky.dev to share the URL \ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68 https://example.com/index.html.",
  "createdAt": "2023-08-07T05:46:10.493943Z",
  "facets": [
    {
      "index": {
        "byteStart": 23,
        "byteEnd": 49
      },
      "features": [
        {
          "$type": "app.bsky.richtext.facet#mention",
          "did": "did:plc:u5cwb2mwiv2bfq53cjufe6yn"
        }
      ]
    },
    {
      "index": {
        "byteStart": 88,
        "byteEnd": 118
      },
      "features": [
        {
          "$type": "app.bsky.richtext.facet#link",
          "uri": "https://example.com/index.html"
        }
      ]
    }
  ]
}
```


## Reply Posts

Reply posts, quote posts, and references to other records all involve "strong references", which are the combination of an AT URI (indicating the repository DID, collection, and record key) and the hash (CID) of the record itself. Compared to just an AT URI, a "strong reference" indicates the specific version of the record being referenced, a concept known as "content addressing". This lets client software detect if the current content no longer matches what existed at the time the reference was made.

A common related task is to parse a web URL for a post (or other record) in to a proper AT URI (starting with `at://`). Here is a naive Python function which will parse either and AT URI or a `https://bsky.app/` URL in to components (repo identifier, collection NSID, and record key):

```python
def parse_at_uri(uri: str) -> Dict:
    if uri.startswith("at://"):
        repo, collection, rkey = uri.split("/")[2:5]
        return {"repo": repo, "collection": collection, "rkey": rkey}
    elif uri.startswith("https://bsky.app/"):
        repo, collection, rkey = uri.split("/")[4:7]
        if collection == "post":
            collection = "app.bsky.feed.post"
        elif collection == "lists":
            collection = "app.bsky.graph.list"
        elif collection == "feed":
            collection = "app.bsky.feed.generator"
        return {"repo": repo, "collection": collection, "rkey": rkey}
    else:
        raise Exception("unhandled URI format: " + uri)
```

To fetch the CID for an existing record, use the `com.atproto.repo.getRecord` endpoint (supplying `repo`, `collection`, and `rkey` query parameters). Note that this function will also handle resolving a handle to a DID, if needed.

Because reply threads can get long and deep, Bluesky requires reply posts to reference both to the immediate "parent" post, and the original "root" post which started the thread. For direct replies to the original post, these will be the same reference, but they are both still required. The easy way to handle resolving the "root" reference is to just resolve the "parent" record and copy any "root" reply reference there. If none exists, the "parent" was a top-level post, and the "parent" reference can be reused.

```python
def get_reply_refs(parent_uri: str) -> Dict:
    uri_parts = parse_uri(parent_uri)

    resp = requests.get(
        "https://bsky.social/xrpc/com.atproto.repo.getRecord",
        params=uri_parts,
    )
    resp.raise_for_status()
    parent = resp.json()

    parent_reply = parent["value"].get("reply")
    if parent_reply is not None:
        root_uri = parent_reply["root"]["uri"]
        root_repo, root_collection, root_rkey = root_uri.split("/")[2:5]
        resp = requests.get(
            "https://bsky.social/xrpc/com.atproto.repo.getRecord",
            params={
                "repo": root_repo,
                "collection": root_collection,
                "rkey": root_rkey,
            },
        )
        resp.raise_for_status()
        root = resp.json()
    else:
        root = parent

    return {
        "root": {
            "uri": root["uri"],
            "cid": root["cid"],
        },
        "parent": {
            "uri": parent["uri"],
            "cid": parent["cid"],
        },
    }
```

The root and parent refs are stored in the `reply` field of posts:

```python
post["reply"] = get_reply_refs("at://bnewbold.bsky.team/app.bsky.feed.post/3k43tv4rft22g")
```

A complete reply post record looks like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "example of a reply",
  "createdAt": "2023-08-07T05:49:40.501974Z",
  "reply": {
    "root": {
      "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k43tv4rft22g",
      "cid": "bafyreig2fjxi3rptqdgylg7e5hmjl6mcke7rn2b6cugzlqq3i4zu6rq52q"
    },
    "parent": {
      "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k43tv4rft22g",
      "cid": "bafyreig2fjxi3rptqdgylg7e5hmjl6mcke7rn2b6cugzlqq3i4zu6rq52q"
    }
  }
}
```

## Quote Posts and Other Record Embeds

"Quote Post" are an example of embedding a reference to another record in a post. Specifically, a reference to another post record (`app.bsky.feed.post`). Some of the other record types which are commonly embedded are lists (`app.bsky.graph.list`) and feed generators (`app.bsky.feed.generator`).

Record embeds are the first of several "embed" options for posts; other examples that we will cover are images and external embeds (webpage "cards"). The Lexicon specifies that the `embed` field is a `union` type, which means only a signal embed type can be included in a single post, and whatever embed object is included needs to disambiguate itself with a `$type` field. This means that, for example, you can not embed both a post record ("quote post") *and* embed images in the same post.

A record embed reference (`app.bsky.embed.record`) is a "strong reference", similar to reply post references. We can use the same helpers to parse a reference (AT URI or `https://bsky.app` URL) and call `com.atproto.repo.getRecord` to get the CID:

```python
def get_embed_ref(ref_uri: str) -> Dict:
    uri_parts = parse_uri(ref_uri)
    resp = requests.get(
        "https://bsky.social/xrpc/com.atproto.repo.getRecord",
        params=uri_parts,
    )
    print(resp.json())
    resp.raise_for_status()
    record = resp.json()

    return {
        "$type": "app.bsky.embed.record",
        "record": {
            "uri": record["uri"],
            "cid": record["cid"],
        },
    }
```

And then add to the post record itself:

```python
post["embed"] = get_embed_ref("https://bsky.app/profile/bnewbold.bsky.team/post/3k44deefqdk2g")
```

A complete quote post record would look like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "example of a quote-post",
  "createdAt": "2023-08-07T05:49:39.417839Z",
  "embed": {
    "$type": "app.bsky.embed.record",
    "record": {
      "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k44deefqdk2g",
      "cid": "bafyreiecx6dujwoeqpdzl27w67z4h46hyklk3an4i4cvvmioaqb2qbyo5u"
    }
  }
}
```

## Images Embeds

Post can also contain embedded images: up to four images, each with distinct alt text and limited 1,000,000 bytes in size. Image files are *referenced* by posts, but are not actually *included* in the post (eg, using `bytes` with base64 encoding). The image files are first uploaded as "blobs" using `com.atproto.repo.uploadBlob`, which returns a `blob` metadata object, which is then embedded in the post record itself.

WARNING: image files in particular often contain personally identifiable metadata (EXIF metadata), including the time and GPS coordinates where the image was created, and information about the camera hardware which could be used to link back to a specific device or individual. It is a strongly recommended best practice to strip this metadata from image files before uploading, unless there is a specific informed intent to share that metadata. The server (PDS) may be more strict about blocking upload of such metadata by default in the future, but it is currently the responsibility of clients (and apps) to sanitize files before upload today.

The mimetype for an image must be provided at upload time, via the `Content-Type` HTTP header. This example code demonstrates reading an image file from disk and uploading it, capturing a `blob` in the response:


```python
IMAGE_PATH = "./example.png"
IMAGE_MIMETYPE = "image/png"
IMAGE_ALT_TEXT = "brief alt text description of the image"

with open(IMAGE_PATH, "rb") as f:
    img_bytes = f.read()

# this size limit is specified in the app.bsky.embed.images lexicon
if len(img_bytes) > 1000000:
    raise Exception(
        f"image file size too large. 1000000 bytes maximum, got: {len(img_bytes)}"
    )

# TODO: strip EXIF metadata here, if needed

resp = requests.post(
    "https://bsky.social/xrpc/com.atproto.repo.uploadBlob",
    headers={
        "Content-Type": IMAGE_MIMETYPE,
        "Authorization": "Bearer " + session["accessJwt"],
    },
    data=img_bytes,
)
resp.raise_for_status()
blob = resp.json()["blob"]
```

The blob object, as JSON, would look something like:

```json
{
    "$type": "blob",
    "ref": {
        "$link": "bafkreibabalobzn6cd366ukcsjycp4yymjymgfxcv6xczmlgpemzkz3cfa"
    },
    "mimeType": "image/png",
    "size": 760898
}
```

The blob is then included in a `app.bsky.embed.images` array, along with an alt-text string. The `alt` field is required for each image. Pass an empty string instead something like "not available" if there is no alt-text available).

```python
post["embed"] = {
    "$type": "app.bsky.embed.images",
    "images": [{
        "alt": IMAGE_ALT_TEXT,
        "image": blob,
    }],
}
```

A complete post record, containing two images, would look something like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "example post with multiple images attached",
  "createdAt": "2023-08-07T05:49:35.422015Z",
  "embed": {
    "$type": "app.bsky.embed.images",
    "images": [
      {
        "alt": "brief alt text description of the first image",
        "image": {
          "$type": "blob",
          "ref": {
            "$link": "bafkreibabalobzn6cd366ukcsjycp4yymjymgfxcv6xczmlgpemzkz3cfa"
          },
          "mimeType": "image/webp",
          "size": 760898
        }
      },
      {
        "alt": "brief alt text description of the second image",
        "image": {
          "$type": "blob",
          "ref": {
            "$link": "bafkreif3fouono2i3fmm5moqypwskh3yjtp7snd5hfq5pr453oggygyrte"
          },
          "mimeType": "image/png",
          "size": 13208
        }
      }
    ]
  }
}
```

## Website Card Embeds

Another type of embed is an external webpage (`app.bsky.embed.external`), including a URL, title, description, and optional image. This type of summary embed is commonly called a "social card". In the Bluesky system, it is the responsibility of the client to fetch and embed this card metadata, including blob upload if needed. Having the card content embedded in the record ensures it appears consistently to everybody, and reduces waves of automated traffic being sent to the referenced website, but it does require some extra work by the client. There are many software libraries and even remove API services to help scrape and parse social card metadata. We provide a naive example for "opengraph" metadata here, using the popular `bs4` (BeautifulSoup) Python library for parsing HTML.

If there is an image URL tag (`og:image`), this example will additionally download that file, naively guess the mimetype from the URL ("sniffing" the image bytes might be more reliable in a real application), upload as a blob, and store the result as thumbnail (`thumb` field).

```python
def fetch_embed_url_card(access_token: str, url: str) -> Dict:

    # the required fields for every embed card
    card = {
        "uri": url,
        "title": "",
        "description": "",
    }

    # fetch the HTML
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # parse out the "og:title" and "og:description" HTML meta tags
    title_tag = soup.find("meta", property="og:title")
    if title_tag:
        card["title"] = title_tag["content"]
    description_tag = soup.find("meta", property="og:description")
    if description_tag:
        card["description"] = description_tag["content"]

    # if there is an "og:image" HTML meta tag, fetch and upload that image
    image_tag = soup.find("meta", property="og:image")
    if image_tag:
        img_url = image_tag["content"]
        # naively turn a "relative" URL (just a path) into a full URL, if needed
        if "://" not in img_url:
            img_url = url + img_url
        resp = requests.get(img_url)
        resp.raise_for_status()
        card["thumb"] = upload_file(access_token, img_url, resp.content)

    return {
        "$type": "app.bsky.embed.external",
        "external": card,
    }
```

An external embed is stored under `embed` like all the others:

```python
post["embed"] = fetch_embed_url_card(session["accessJwt"], "https://bsky.app")
)
```

A complete post record with an external embed, including image thumbnail blob, looks like:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "post which embeds an external URL as a card",
  "createdAt": "2023-08-07T05:46:14.423045Z",
  "embed": {
    "$type": "app.bsky.embed.external",
    "external": {
      "uri": "https://bsky.app",
      "title": "Bluesky Social",
      "description": "See what's next.",
      "thumb": {
        "$type": "blob",
        "ref": {
          "$link": "bafkreiash5eihfku2jg4skhyh5kes7j5d5fd6xxloaytdywcvb3r3zrzhu"
        },
        "mimeType": "image/png",
        "size": 23527
      }
    }
  }
}
```

## Putting It All Together

A complete script, with command-line argument parsing, is available [as a Github gist](https://gist.github.com/bnewbold/ebc172c927b6a64d536bdf46bd5c2925).

As mentioned at the beginning, we expect most folks will use SDKs or libraries for their programming language of choice to help with most of the details described here. But sometimes it is helpful to see what is actually going on behind the abstractions.
