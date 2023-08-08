---
title: Posting via the Bluesky API
summary: The Bluesky post record type has many features, including replies, quote-posts, embedded social cards, mentions, and images. Here's some example code for all the common post formats.
date: Aug 8, 2023
---

# Posting via the Bluesky API
*Published on: Aug 8, 2023*

Note: This blog post is a snapshot in time and may get out of date as new features are added to atproto and the Bluesky application schemas. The source of truth for the application API is the Lexicons themselves (currently [versioned on Github](https://github.com/bluesky-social/atproto/tree/main/lexicons)). The overall protocol is described at [atproto.com](https://atproto.com).

## How do I make a Bluesky post via the API?

First, you'll need a Bluesky account. If you're a developer in need of an invite, fill out the developer waitlist [here](https://atproto.com/blog/call-for-developers) and we'll send you an invite code.

The basics of posting to Bluesky via the API are straightforward. Let's try this via your terminal. Set your Bluesky handle and App Password as environment variables.
```sh
export BLUESKY_HANDLE="example.bsky.social"
export BLUESKY_APP_PASSWORD="123-456-789"
```

Then, create a new session and post a simple text post with the below snippet. You may need to install [HTTPie](https://httpie.io/docs/cli/pypi) first: `brew install httpie`.

```sh
export AUTH_TOKEN=`http post https://pds.bsky.social/xrpc/com.atproto.server.createSession \
        identifier="$BLUESKY_HANDLE" \
        password="$BLUESKY_APP_PASSWORD" \
    | jq .accessJwt -r`
http post https://pds.bsky.social/xrpc/com.atproto.repo.createRecord \
    Authorization:"Bearer $AUTH_TOKEN" \
    repo="$BLUESKY_HANDLE" \
    collection=app.bsky.feed.post \
    record:="{\"text\": \"Hello world! I posted this via the API.\", \"createdAt\": \"`date -u +"%Y-%m-%dT%H:%M:%SZ"`\"}"
```

Posts can get a lot more complicated — reply threads, mentions, quote posts, embedding images and link cards, and more. This guide will walk you through how to create these more complex posts in Python, but there are many [API clients and SDKs for other programming languages](https://atproto.com/community/projects#at-protocol-implementations) and Bluesky PBC publishes atproto code in [TypeScript](https://github.com/bluesky-social/atproto) and [Go](https://github.com/bluesky-social/indigo) as well.

You can get a copy of the full script from [this Github Gist](https://gist.github.com/bnewbold/ebc172c927b6a64d536bdf46bd5c2925). It was tested with Python 3.11, with the `requests` and `bs4` (BeautifulSoup) packages installed.

## Authentication

Posting something on Bluesky requires authentication (that is, you'll need to be logged in to your account). Make sure to have your Bluesky account handle and [App Password](https://atproto.com/specs/xrpc#app-passwords) handy. You also need to know the service URL of your hosting provider — this is the server that hosts your content. If you're using Bluesky's default, this is `https://bsky.social/` — that's our primary PDS service.

The `com.atproto.server.createSession` API endpoint returns a session object containing two API tokens: an **access token** (`accessJwt`) which is used to authenticate requests but expires after a few minutes, and a **refresh token** (`refreshJwt`) which lasts longer and is used only to update the session with a new access token. Since we're just publishing a single post, we can get away with a single session and not bother with refreshing.

This script will create a session and authenticate with your account handle and App Password.

```python
import requests

BLUESKY_HANDLE = "example.bsky.social"
BLUESKY_APP_PASSWORD = "123-456-789"

resp = requests.post(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    json={"identifier": BLUESKY_HANDLE, "password": BLUESKY_APP_PASSWORD},
)
resp.raise_for_status()
session = resp.json()
print(session["accessJwt"]
```

## Post Record Structure

Now that we're authenticated, we can create a simple post. Bluesky posts are repository records with the [Lexicon type](https://atproto.com/lexicons/app-bsky-feed#appbskyfeedpost) `app.bsky.feed.post` — this just defines the schema for what a post looks like.

The `com.atproto.repo.createRecord` endpoint is used to actually create **records** in the repository. A post is a type of record.

Each post requires these fields: `text` and `createdAt` (a timestamp). The `$type` field should also be included in every record, though the server will fill this in for you based on the collection indicated in the `createRecord` request body if it isn't included.

Here is what a basic post record should look like, as a JSON object:

```json
{
  "$type": "app.bsky.feed.post",
  "text": "Hello World!",
  "createdAt": "2023-08-07T05:31:12.156888Z"
}
```

For some record types, you'll need to specify the record key (`rkey`), which is like a filename for the record. For posts, it's fine and easier to just let the server create one automatically.

This script below will create a simple post with just a text field and a timestamp. You'll need the `datetime` package installed.

```python
from datetime import datetime, timezone

# Fetch the current time
# Using a trailing "Z" is preferred over the "+00:00" format
now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

# Required fields that each post must include
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

The full reposistory path (including the auto-generated `rkey`) will be returned as a response to the `createRecord` request. It looks like:

```json
{
  "uri": "at://did:plc:u5cwb2mwiv2bfq53cjufe6yn/app.bsky.feed.post/3k4duaz5vfs2b",
  "cid": "bafyreibjifzpqj6o6wcq3hejh7y4z4z2vmiklkvykc57tw3pcbx3kxifpm"
}
```

## Setting the Post's Language

You can set the post's (human) language, which help will custom feeds or other services parse the post. For example, perhaps a user only wants to show English-language posts in their feed — they would use this field to filter out posts in other languages.

Use the `langs` field to indicate the post language, which can be an array of strings in BCP-47 format. (This is the same standard and format used by web browsers to encode language and localization context.)

You can include multiple values in the array if there are multiple languages present in the post. The Bluesky Social client auto-detects the languages in each post and sets them as the default `langs` value, but a user can override the configuration on a per-post basis.

This snippet sets the `text` and `langs` value of a post to be Thai and English.
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

Mentions (tags of other accounts) and URLs are rendered in rich-text in the Bluesky client to make them visibly clickable. They're expected to look and act like hyperlinks. The client, not the server, is responsible for parsing these patterns and creating links (or "facets").

Facets are external rich text annotations on top of the plain text string that is the post text itself. 

In this Python example below, we'll check for handle mentions (which look like `@example.bsky.social`) and HTTP/S URLs (which look like `https://example.com`). Note that the regexes used here to identify mentions and URLs are fairly naive, and could be more rigorous.

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

Note: The facet `start` and `stop` values are counted by UTF-8 bytes, not Unicode codepoints, graphemes, or grapheme clusters. In the above Python snippet, we use regex matching over bytestrings directly (which is supported by the Python standard library).

Once the facet segments have been parsed out, we can then turn them into `app.bsky.richtext.facet` objects. You can view the schema of a facet object [here](https://atproto.com/lexicons/app-bsky-richtext#appbskyrichtextfacet).

This schema requires:
- Handles must be resolved to DIDs, which can be done server-side using the `com.atproto.identity.resolveHandle` endpoint.
- Since both `app.bsky.richtext.facet#mention` and `app.bsky.richtext.facet#link` objects can appear in the `features` array of a facet, a `$type` field needs to be included in each object to disambiguate between the two.

Here's a Python script to parse the facets from the text and resolve the handles to DIDs:

```python
def parse_facets(text: str) -> List[Dict]:
    facets = []
    for m in parse_mentions(text):
        resp = requests.get(
            "https://bsky.social/xrpc/com.atproto.identity.resolveHandle",
            params={"handle": m["handle"]},
        )
        # If the handle can't be resolved, just skip it!
        # It will be rendered as text in the post instead of a link
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
post["text"] = "✨ example mentioning @atproto.com to share the URL 👨‍❤️‍👨 https://en.wikipedia.org/wiki/CBOR.
post["facets"] = parse_facets(post["text"])
```

The post record will then look like this::

```json
{
  "$type": "app.bsky.feed.post",
  "text": "\u2728 example mentioning @atproto.com to share the URL \ud83d\udc68\u200d\u2764\ufe0f\u200d\ud83d\udc68 https://en.wikipedia.org/wiki/CBOR.",
  "createdAt": "2023-08-08T01:03:41.157302Z",
  "facets": [
    {
      "index": {
        "byteStart": 23,
        "byteEnd": 35
      },
      "features": [
        {
          "$type": "app.bsky.richtext.facet#mention",
          "did": "did:plc:ewvi7nxzyoun6zhxrhs64oiz"
        }
      ]
    },
    {
      "index": {
        "byteStart": 74,
        "byteEnd": 108
      },
      "features": [
        {
          "$type": "app.bsky.richtext.facet#link",
          "uri": "https://en.wikipedia.org/wiki/CBOR"
        }
      ]
    }
  ]
}
```


## Replies, Quote Posts, and Embeds

When you post a reply or a quote post, this post will contain a **strong reference** to another record — either the post you're replying to, or the post you're quoting, etc.

A strong reference is a combination of:
- **AT URI:** indicates the repository DID, collection, and record key
- **CID:** the hash of the record itself

A strong reference indicates the specific version of the record being referenced, a concept known as content addressing. This lets client software detect if the current content no longer matches what existed at the time the reference was made. An AT URI alone does not do this.

Here is a naive Python function which will parse either an AT URI or a `https://bsky.app/` URL in to components (repo identifier, collection NSID, and record key):

```python
def parse_at_uri(uri: str) -> Dict:
    # Handle AT URIs
    if uri.startswith("at://"):
        repo, collection, rkey = uri.split("/")[2:5]
        return {"repo": repo, "collection": collection, "rkey": rkey}
    # Handle bsky.app URLs
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

### Replies

Because reply threads can get long and contain many replies, Bluesky requires reply posts to reference both to the immediate "parent" post, and the original "root" post which started the thread. For direct replies to the original post, these will be the same reference, but they are both still required.

The easiest way to find a post's root reference is to just resolve its parent record and copy whatever the root reply reference value there is. If none exists, then the parent record was a top-level post, so that parent reference can be reused as the root value.

Here's a Python snippet to find the parent and root values:

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
        # The parent record is a top-level post, so it is also the root
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
post["reply"] = get_reply_refs("at://atproto.com/app.bsky.feed.post/3k43tv4rft22g")
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

### Quote Posts

When you post a quote post, you're embedding a reference to another post record (the original post) in a post (the quote post). The post record type is `app.bsky.feed.post`, but you can also embed other record types in a post, like lists (`app.bsky.graph.list`) and feed generators (`app.bsky.feed.generator`).

Posts can have several types of embeds: record embeds, images and exernal embeds (like link/webpage cards, which is the preview that shows up when you post a URL). The [Lexicon for embeds](https://atproto.com/lexicons/app-bsky-embed) specifies that only a single embed type can be included per post, and that the embedded object needs to include a `$type` field. In practice, this means that, for example, you cannot embed both a post record ("quote post") *and* embed images in the same post.

A record embed reference (`app.bsky.embed.record`) is a strong reference, similar to reply post references. We can use the same helpers to parse a reference (AT URI or `https://bsky.app` URL) and call `com.atproto.repo.getRecord` to get the CID:

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
post["embed"] = get_embed_ref("https://bsky.app/profile/atproto.com/post/3k44deefqdk2g")
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

### Images Embeds

When you post an image on Bluesky, that image is treated as an embedded object to a post. Each post can contain up to four images, and each image can have its own alt text and is limited to 1,000,000 bytes in size.

Image files are *referenced* by posts, but are not actually *included* in the post (eg, using `bytes` with base64 encoding). The image files are first uploaded as "blobs" using `com.atproto.repo.uploadBlob`, which returns a `blob` metadata object, which is then embedded in the post record itself.

**Warning:** Image files in particular often contain personally identifiable metadata (EXIF metadata), including the time and GPS coordinates where the image was created, and information about the camera hardware which could be used to link back to a specific device or individual. It is a strongly recommended best practice to strip this metadata from image files before uploading, unless there is a specific informed intent to share that metadata. The server (PDS) may be more strict about blocking upload of such metadata by default in the future, but it is currently the responsibility of clients (and apps) to sanitize files before upload today.

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

The blob is then included in a `app.bsky.embed.images` array, along with an alt-text string. The `alt` field is required for each image. You should pass an empty string if there is no alt-text available instead of something like "not available." 

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

### Website Card Embeds

A website card embed, often called a "social card," is the rendered preview of a website link. It includes the link, a title, and optionally a preview image. View the lexicon for external embeds `app.bsky.embed.external` [here](https://atproto.com/lexicons/app-bsky-embed#appbskyembedexternal).

On Bluesky, each client fetches and embeds this card metadata, including blob upload if needed. Embedding the card content in the record ensures that it appears consistently to everyone and reduces waves of automated traffic being sent to the referenced website, but it does require some extra work by the client. There are many software libraries and even remove API services to help scrape and parse social card metadata. We provide a naive example for "opengraph" metadata below, using the popular `bs4` (BeautifulSoup) Python library for parsing HTML.

If there is an image URL tag (`og:image`), this example will additionally download that file, naively guess the mimetype from the URL, upload as a blob, and store the result as thumbnail (`thumb` field).

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
