---
title: Download and Parse Repository Exports
summary: How to download and parse repository data exports using Go.
date: Nov 6, 2023
---

# Download and Parse Repository Exports
*Published on: Nov 6, 2023*

One of the core principles of the AT Protocol is simple access to public data, including posts, multimedia blobs, and social graph metadata. A user's data is stored in a repository, which can be efficiently exported all together as a CAR file (`.car`). This post will describe how to export and parse a data repository.

A user's [data repository](https://atproto.com/guides/data-repos#data-layout) consists of individual records, each of which can be accessed in JSON format via HTTP API endpoints.

The example code in this post is in the Go programming language, and uses the atproto SDK packages from [indigo](https://github.com/bluesky-social/indigo). You can find the full source code in our [example cookbook GitHub repository](https://github.com/bluesky-social/cookbook/go-repo-export).

This post is written for a developer audience. We plan on adding a feature for users to easily export their own data from within the app in the future.

## Privacy Notice

While atproto data is public, you should take care to respect the rights, intents, and expectations of others. The following examples work for downloading any account's public data.

This goes beyond following copyright law, and includes respecting content deletions and block relationships. Images and other media content does not come with any reuse rights, unless explicitly noted by the account holder.

## Download a Repository

### On Bluesky's Main PDS Instance

You can easily construct a URL to download a repository on Bluesky's main PDS instance. In this case, the PDS host is `https://bsky.social`, the Lexicon endpoint is `com.atproto.sync.getRepo`, and the account DID is passed as a query parameter.

As a result, the download URL for the `@atproto.com` account is:

```
https://bsky.social/xrpc/com.atproto.sync.getRepo?did=did:plc:ewvi7nxzyoun6zhxrhs64oiz
```

Note that this endpoint intentionally does not require authentication: content in a user's repository is public (much like a public website), and anybody can download it from the web. Such content includes posts and likes, but does not include content like mutes and list subscriptions.

If you navigate to that URL, you'll download the repository for the `@atproto.com` account on Bluesky. But if you try to open that file, it won't make sense yet. We'll show you how to parse the data [later in this post](#parse-records-from-car-file-as-json).

### On Another Instance

In the more general case, we start with any "AT Identifier" (handle or DID). We need to find account's PDS instance. This involves first resolving the handle or DID to the account's DID document, then parsing out the `#atproto_pds` service entry.

The `github.com/bluesky-social/indigo/atproto/identity` package handles all of this for us already:

```go
import (
    "fmt"
    "context"

    "github.com/bluesky-social/indigo/atproto/identity"
    "github.com/bluesky-social/indigo/atproto/syntax"
    "github.com/bluesky-social/indigo/xrpc"
)

func main() {
    run()
}

func run() error {
    ctx := context.Background()
    atid, err := syntax.ParseAtIdentifier("atproto.com")
    if err != nil {
        return err
    }    

    dir := identity.DefaultDirectory()
    ident, err := dir.Lookup(ctx, *atid)
    if err != nil {
        return err
    }

    if ident.PDSEndpoint() == "" {
        return fmt.Errorf("no PDS endpoint for identity")
    }

    fmt.Println(ident.PDSEndpoint())
}
```

Once we know the PDS endpoint, we can create an atproto API client, call the `getRepo` endpoint, and write the results out to a local file on disk:

```go
carPath := ident.DID.String() + ".car"

xrpcc := xrpc.Client{
    Host: ident.PDSEndpoint(),
}

repoBytes, err := comatproto.SyncGetRepo(ctx, &xrpcc, ident.DID.String(), "")
if err != nil {
    return err
}

err = os.WriteFile(carPath, repoBytes, 0666)
if err != nil {
    return err
}
```

The `go-export-repo` example from the cookbook repository implements this with the `download-repo` command:

```shell
> ./go-export-repo download-repo atproto.com
resolving identity: atproto.com
downloading from https://bsky.social to: did:plc:ewvi7nxzyoun6zhxrhs64oiz.car
```

Now you know that the @atproto.com account's PDS instance is at `bsky.social`, and we've downloaded the repository's CAR file.

## Parse Records from CAR File as JSON

### What's a CAR File?

CAR files are a [standard file format](https://ipld.io/specs/transport/car/carv1/) from the IPLD ecosystem. They stand for "Content Addressable aRchives." They have a simple binary format, with a series of binary (CBOR) blocks concatenated together, not dissimilar to `tar` files or Git packfiles. They're well-suited for efficient data processing and archival storage, but they're not the most accessible to developers.

### The Repository CAR File

The repository data structure is a key-value store, with the keys being a combination of a collection name (NSID) and "record key", separated by a slash (`<collection>/<rkey>`). The CAR file contains a reference (CID) pointing to a (signed) commit object, which then points to the top of the key-value tree. The commit object also has an atproto repo version number (at time of writing, currently `3`), the account DID, and a revision string.

Let's load the repository tree structure out of the CAR file in to memory, and list all of the record paths (keys).

```go

import (
    "encoding/json"
    "context"
    "fmt"
    "os"
    "path/filepath"

    "github.com/bluesky-social/indigo/repo"
)
func carList(carPath string) error {
    ctx := context.Background()
    fi, err := os.Open(carPath)
    if err != nil {
        return err
    }

    // read repository tree in to memory
    r, err := repo.ReadRepoFromCar(ctx, fi)
    if err != nil {
        return err
    }

    // extract DID from repo commit
    sc := r.SignedCommit()
    did, err := syntax.ParseDID(sc.Did)
    if err != nil {
        return err
    }
    topDir := did.String()

    // iterate over all of the records by key and CID
    err = r.ForEach(ctx, "", func(k string, v cid.Cid) error {
        fmt.Printf("%s\t%s\n", k, v.String())
        return nil
    })
    if err != nil {
        return err
    }
    return nil
}
```

Note that the `ForEach` iterator provides a record path string as a key, and a CID as the value, instead of the record data itself. If we want to get the record itself, we need to fetch the "block" (CBOR bytes) from the repository, using the CID reference. 

Let's also convert the binary CBOR data in to a more accessbile JSON format, and write out records to disk. The following code snippet could go in the `ForEach` function in the previous example:

```go
// where to write out data on local disk
recPath := topDir + "/" + k
os.MkdirAll(filepath.Dir(recPath), os.ModePerm)
if err != nil {
    return err
}


// fetch the record CBOR and convert to a golang struct
_, rec, err := r.GetRecord(ctx, k)
if err != nil {
    return err
}

// serialize as JSON
recJson, err := json.MarshalIndent(rec, "", "  ")
if err != nil {
    return err
}

if err := os.WriteFile(recPath+".json", recJson, 0666); err != nil {
    return err
}

return nil
```

In the cookbook repository, the `go-repo-export` example implements these as `list-records` and `unpack-record`:

```shell
> ./go-export-repo list-records did:plc:ewvi7nxzyoun6zhxrhs64oiz.car                                                
=== did:plc:ewvi7nxzyoun6zhxrhs64oiz ===
key record_cid
app.bsky.actor.profile/self bafyreifbxwvk2ewuduowdjkkjgspiy5li2dzyycrnlbu27gn3hfgthez3u
app.bsky.feed.like/3jucagnrmn22x    bafyreieohq4ngetnrpse22mynxpinzfnaw6m5xcsjj3s4oiidjlnnfo76a
app.bsky.feed.like/3jucahkymkk2e    bafyreidqrmqvrnz52efgqfavvjdbwob3bc2g3vvgmhmexgx4xputjty754
app.bsky.feed.like/3jucaj3qgmk2h    bafyreig5c2atahtzr2vo4v64aovgqbv6qwivfwf3ex5gn2537wwmtnkm3e
[...]

> ./go-export-repo unpack-records did:plc:ewvi7nxzyoun6zhxrhs64oiz.car
writing output to: did:plc:ewvi7nxzyoun6zhxrhs64oiz
did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.actor.profile/self.json
did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.like/3jucagnrmn22x.json
did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.like/3jucahkymkk2e.json
did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.like/3jucaj3qgmk2h.json
[...]
```

If you were downloading and working with CAR in a higher-stakes situation than just running a one-off repository export, you would probably want to confirm the commit signature using the account's signing public key (included in the resolved identity metadata). Signing keys can change over time, meaning the signatures in old repo exports will no longer validate. It may be a good idea to keep a copy of the identity metadata along side the repository for long-term storage.


## Downloading Blobs

An account's repository contains all the current (not deleted) records. These records include likes, posts, follows, etc. and may refer to images and other media "blobs" by hash (CID), but the blobs themselves aren't stored directly in the repository. So if you want a full public account data export, you also need to fetch the blobs.

It is possible to parse through all the records in a repository and extract all the blob references (tip: they all have `$type: blob`). But PDS instances also implement a helpful `com.atproto.sync.listBlobs` endpoint, which returns all the CIDs (blob hashes) for a specific account (DID).

The `com.atproto.sync.getBlob` endpoint is used to download the original blob itself.

Neither of these PDS endpoints require authentication, though they may be rate-limited by operators to prevent resource exhaustion or excessive bandwidth costs.

Note that the first part of the blob download function is very similar to the CAR download: resolving identity to find the account's PDS:

```go
func blobDownloadAll(raw string) error {
    ctx := context.Background()
    atid, err := syntax.ParseAtIdentifier(raw)
    if err != nil {
        return err
    }

    // resolve the DID document and PDS for this account
    dir := identity.DefaultDirectory()
    ident, err := dir.Lookup(ctx, *atid)
    if err != nil {
        return err
    }

    // create a new API client to connect to the account's PDS
    xrpcc := xrpc.Client{
        Host: ident.PDSEndpoint(),
    }
    if xrpcc.Host == "" {
        return fmt.Errorf("no PDS endpoint for identity")
    }

    topDir := ident.DID.String() + "/_blob"
    os.MkdirAll(topDir, os.ModePerm)

    // blob-specific part starts here!
    cursor := ""
    for {
        // loop over batches of CIDs
        resp, err := comatproto.SyncListBlobs(ctx, &xrpcc, cursor, ident.DID.String(), 500, "")
        if err != nil {
            return err
        }
        for _, cidStr := range resp.Cids {
            // if the file already exists, skip
            blobPath := topDir + "/" + cidStr
            if _, err := os.Stat(blobPath); err == nil {
                continue
            }

            // download the entire blob in to memory, then write to disk
            blobBytes, err := comatproto.SyncGetBlob(ctx, &xrpcc, cidStr, ident.DID.String())
            if err != nil {
                return err
            }
            if err := os.WriteFile(blobPath, blobBytes, 0666); err != nil {
                return err
            }
        }

        // a cursor in the result means there are more CIDs to enumerate
        if resp.Cursor != nil && *resp.Cursor != "" {
            cursor = *resp.Cursor
        } else {
            break
        }
    }
    return nil
}
```

In the cookbook repository, the `go-repo-export` example implements `list-blobs` and `download-blobs` commands:

```
> ./go-export-repo list-blobs atproto.com
bafkreiacrjijybmsgnq3mca6fvhtvtc7jdtjflomoenrh4ph77kghzkiii
bafkreib4xwiqhxbqidwwatoqj7mrx6mr7wlc5s6blicq5wq2qsq37ynx5y
bafkreibdnsisdacjv3fswjic4dp7tju7mywfdlcrpleisefvzf44c3p7wm
bafkreiebtvblnu4jwu66y57kakido7uhiigenznxdlh6r6wiswblv5m4py
[...]

> ./go-export-repo download-blobs atproto.com
writing blobs to: did:plc:ewvi7nxzyoun6zhxrhs64oiz/_blob
did:plc:ewvi7nxzyoun6zhxrhs64oiz/_blob/bafkreiacrjijybmsgnq3mca6fvhtvtc7jdtjflomoenrh4ph77kghzkiii  downloaded
did:plc:ewvi7nxzyoun6zhxrhs64oiz/_blob/bafkreib4xwiqhxbqidwwatoqj7mrx6mr7wlc5s6blicq5wq2qsq37ynx5y  downloaded
did:plc:ewvi7nxzyoun6zhxrhs64oiz/_blob/bafkreibdnsisdacjv3fswjic4dp7tju7mywfdlcrpleisefvzf44c3p7wm  downloaded
[...]
```

This will download blobs for a repository.

A more rigorous implementation should verify the blob CID (by hashing the downloaded bytes), at a minimum to detect corruption and errors.