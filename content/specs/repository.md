---
title: Repository
summary: Self-authenticating storage for public account content
---

# Repository

*See the [Data Repositories Guide](../guides/data-repos) for a higher-level introduction.*

Public atproto content (**records**) is stored in per-account repositories (frequently shortened to **repo**). All currently active records are stored in the repository, and current repository contents are publicly available, but both content deletions and account deletions are fully supported.

The repository data structure is content-addressed (a [Merkle-tree](https://en.wikipedia.org/wiki/Merkle_tree)), and every mutation of repository contents (eg, addition, removal, and updates to records) results in a new commit `data` hash value (CID). Commits are cryptographically signed, with rotatable signing keys, which allows recursive validation of content as a whole or in part.

Repositories and their contents are canonically stored in binary [DAG-CBOR](https://ipld.io/docs/codecs/known/dag-cbor/) format, as a graph of [IPLD](https://ipld.io/docs/data-model/) data objects referencing each other by content hash (CID Links). Large binary blobs are not stored directly in repositories, though they are referenced by hash ([CID](https://github.com/multiformats/cid)). This includes images and other media objects. Repositories can be exported as [CAR](https://ipld.io/specs/transport/car/carv1/) files for offline backup, account migration, or other purposes.

In the atproto federation architecture, the authoritative location of an account's repository is the associated Personal Data Server (PDS). An account's current PDS location is authoritatively indicated in the DID Document.

In real-world use, it is expected that individual repositories will contain anywhere from dozens to millions of records.


## Repo Data Structure (v3)

This describes version `3` of the repository binary format.

Version `2` had a slightly different commit object schema, but is mostly compatible with `3`.

Version `1` had a different MST fanout configuration, and an incompatible schema for commits and repository metadata. Version `1` is deprecated, no repositories in this format exist in the network, and implementations do not need to support it.

At a high level, a repository is a key/value mapping where the keys are path names (as strings) and the values are records (DAG-CBOR objects).

A **Merkle Search Tree** (MST) is used to store this mapping. This content-addressed deterministic data structure stores data in key-sorted order. It is reasonably efficient for key lookups, key range scans, and appends (assuming sorted record paths). The properties of MSTs in general are described in this academic publication:

> Alex Auvolat, François Taïani. Merkle Search Trees: Efficient State-Based CRDTs in Open Networks. SRDS 2019 - 38th IEEE International Symposium on Reliable Distributed Systems, Oct 2019, Lyon, France. pp.1-10, ff10.1109/SRDS.2019.00032 ([pdf](https://inria.hal.science/hal-02303490/document))

The specific details of the MST as used in atproto repositories are described below.

Repo paths are strings, while MST keys are byte arrays. Neither may be empty (zero-length). While repo path strings are currently limited to a subset of ASCII (making encoding a no-op), the encoding is specified as UTF-8.

Repo paths currently have a fixed structure of `<collection>/<record-key>`. This means a valid, normalized [NSID](./nsid), followed by a `/`, followed by a valid [Record Key](./record-key). The path should not start with a leading `/`, and should always have exactly two path segments. The ASCII characters allowed in the entire path string are currently: letters (`A-Za-z`), digits (`0-9`), slash (`/`), period (`.`), hyphen (`-`), underscore (`_`), and tilde (`~`). The specific path segments `.` and `..` are not valid NSIDs or Record Keys, and will always be disallowed in repo paths.

Note that repo paths for all records in the same collection are sorted together in the MST, making enumeration (via key scan) and export efficient. Additionally, the TID Record Key scheme was intentionally selected to provide chronological sorting of MST keys within the scope of a collection. Appends are more efficient than random insertions/mutations within the tree, and when enumerating records within a collection they will be in chronological order (assuming that TID generation was done correctly, which cannot be relied on in general).


### Commit Objects

The top-level data object in a repository is a signed commit. The IPLD schema fields are:

- `did` (string, required): the account DID associated with the repo, in strictly normalized form (eg, lowercase as appropriate)
- `version` (integer, required): fixed value of `3` for this repo format version
- `data` (CID link, required): pointer to the top of the repo contents tree structure (MST)
- `rev` (string, TID format, required): revision of the repo, used as a logical clock. Must increase monotonically. Recommend using current timestamp as TID; `rev` values in the "future" (beyond a fudge factor) should be ignored and not processed.
- `prev` (CID link, nullable): pointer (by hash) to a previous commit object for this repository. Could be used to create a chain of history, but largely unused (included for v2 backwards compatibility). In version `3` repos, this field must exist in the CBOR object, but is virtually always `null`. NOTE: previously specified as nullable and optional, but this caused interoperability issues.
- `sig` (byte array, required): cryptographic signature of this commit, as raw bytes

An UnsignedCommit data object has all the same fields except for `sig`. The process for signing a commit is to populate all the data fields, and then serialize the UnsignedCommit with DAG-CBOR. The output bytes are then hashed with SHA-256, and the binary hash output (without hex encoding) is then signed using the current "signing key" for the account. The signature is then stored as raw bytes in a commit object, along with all the other data fields.

The CID for a commit overall is generated by serializing a *signed* commit object as DAG-CBOR. See notes on the "blessed" CID format below, and in particular be sure to use the `dag-cbor` multicodec for CIDs linking to commit objects.

Note that neither the signature itself nor the signed commit indicate either the type of key used (curve type), or the specific public key used. That information must be fetched from the account's DID document. With key rotation, verification of older commit signatures can become ambiguous. The most recent commit should always be verifiable using the current DID document. This implies that a new repository commit should be created every time the signing key is rotated. Such a commit does not need to update the `data` CID link.


### MST Structure

At a high level, the repository MST is a key/value mapping where the keys are non-empty byte arrays, and the values are CID links to records. The MST data structure should be fully reproducible from such a mapping of bytestrings-to-CIDs, with exactly reproducible root CID hash (aka, the `data` field in commit object).

Every node in the tree structure contains a set of key/CID mappings, as well as links to other sub-tree nodes. The entries and links are in key-sorted order, with all of the keys of a linked sub-tree (recursively) falling in the range corresponding to the link location. The sort order is from **left** (lexically first) to **right** (lexically latter). Each key has a **depth** derived from the key itself, which determines which sub-tree it ends up in. The top node in the tree contains all of the keys with the highest depth value (which for a small tree may be all depth zero, so a single node). Links to the left or right of the entire node, or between any two keys in the node, point to a sub-tree node containing keys that fall in the corresponding key range.

An empty repository with no records is represented as a single MST node with an empty array of entries. This is the only situation in which a tree may contain an empty leaf node which does not either contain keys ("entries") or point to a sub-tree containing entries. The top of the tree must not be a an empty node which only points to a sub-tree. Empty intermediate nodes are allowed, as long as they point to a sub-tree which does contain entries. In other words, empty nodes must be pruned from the top and bottom of the tree, but empty intermediate nodes must be kept, such that sub-tree links do not skip a level of depth. The overall structure and shape of the MST is deterministic based on the current key/value content, regardless of the history of insertions and deletions that lead to the current contents.

For the atproto MST implementation, the hash algorithm used is SHA-256 (binary output), counting "prefix zeros" in 2-bit chunks, giving a fanout of 4. To compute the depth of a key:

- hash the key (a byte array) with SHA-256, with binary output
- count the number of leading binary zeros in the hash, and divide by two, rounding down
- the resulting positive integer is the depth of the key

Some examples, with the given ASCII strings mapping to byte arrays:

- `2653ae71`: depth "0"
- `blue`: depth "1"
- `app.bsky.feed.post/454397e440ec`: depth "4"
- `app.bsky.feed.post/9adeb165882c`: depth "8"

There are many MST nodes in repositories, so it is important that they have a compact binary representation, for storage efficiency. Within every node, keys (byte arrays) are compressed by eliding common prefixes, with each entry indicating how many bytes it shares with the previous key in the array. The first entry in the array for a given node must contain the full key, and a common prefix length of 0. This key compaction is internal to nodes, it does not extend across multiple nodes in the tree. The compaction scheme is mandatory, to ensure that the MST structure is deterministic across implementations.

The node IPLD schema fields are:

- `l` ("left", CID link, optional): link to sub-tree Node on a lower level and with all keys sorting before keys at this node
- `e` ("entries", array of objects, required): ordered list of TreeEntry objects
    - `p` ("prefixlen", integer, required): count of bytes shared with previous TreeEntry in this Node (if any)
    - `k` ("keysuffix", byte array, required): remainder of key for this TreeEntry, after "prefixlen" have been removed
    - `v` ("value", CID Link, required): link to a sub-tree Node at a lower level which has keys sorting after this TreeEntry's key (to the "right"), but before the next TreeEntry's key in this Node (if any)

When parsing MST data structures, the depth and sort order of keys should be verified. This is particularly true for untrusted inputs, but is simplest to just verify every time. Additional checks on node size and other parameters of the tree structure also need to be limited; see the "Security Considerations" section of this document.

### CID Formats

The IPFS CID specification is very flexible, and supports a wide variety of hash types, a field indicating the type of content being linked to, and various string encoding options. These features are valuable to allow evolution of the repo format over time, but to maximize interoperability among implementations, only a specific "blessed" set of CID types are allowed.

The blessed format for commit objects and MST node objects, when linking to commit objects, MST nodes (aka, `data`, or MST internal links), or records (aka, MST leaf nodes to records), is:

- CIDv1
- Multibase: binary serialization within DAG-CBOR (or `base32` for JSON mappings)
- Multicodec: `dag-cbor` (0x71)
- Multihash: `sha-256` with 256 bits (0x12)

In the context of repositories, it is also desirable for the overall data structure to be reproducible given the contents, so the allowed CID types are strictly constrained and enforced. Commit objects with non-compliant `prev` or `data` links are considered invalid. MST Node objects with non-compliant links to other MST Node objects are considered invalid, and the entire MST data structure invalid.

More flexibility is allowed in processing the "leaf" links from MST to records, and implementations should retain the exact CID links used for these mappings, instead of normalizing. Implementations should strictly follow the CID blessed format when generating new CID Links to records.


## CAR File Serialization

The standard file format for storing IPLD data is Content Addressable aRchives (CAR). The standard repository export format for atproto repositories is [CAR v1](https://ipld.io/specs/transport/car/carv1/), which have file suffix `.car` and mimetype `application/vnd.ipld.car`.

The CARv1 format is very simple. It contains a small metadata header (which can indicate one or more "root" CID links), and then a series of binary "blocks", each of which is an IPLD object. In the context of atproto repositories:

- The first element of the CAR `roots` metadata array must be the CID of the most relevant Commit object. for a generic export, this is the current (most recent) commit. additional CIDs may also be present in the `roots` array, with (for now) undefined meaning or order
- For full exports, the full repo structure must be included for the indicated commit, which includes all records and all MST nodes
- The order of blocks within the CAR file is not currently defined or restricted. implementations may have a "preferred" ordering, but should be tolerant of unexpected ordering
- Additional blocks, including records, may or may not be included in the CAR file

When importing CAR files, note that there may existing dangling CID references. For example, repositories may contain CID Links to blobs or records in other repositories, and the IPLD blocks corresponding to those blobs or references would likely not be included in the CAR file.

The CARv1 specification is agnostic about the same block appearing multiple times in the same file ("Duplicate Blocks)". Implementations should be robust to both duplication and de-duplication of blocks, and should also ignore any unnecessary or unlinked blocks.


## Security Considerations

Repositories are untrusted input: accounts have full control over repository contents, and PDS instances have full control over binary encoding. It is important to handle possible denial of service vectors from both hostile actors or accidental situations (eg, corrupted data or buggy implementations).

Generic precautions should be followed with CBOR decoding: a maximum serialized object size, a maximum recursion depth for nested fields, maximum memory budget for deserialized data, etc. Some CBOR libraries include these precautions by default, but others do not.

The efficiency of the MST data structure depends on key hashes being relatively randomly dispersed. Because accounts have control over Record Keys, they can mine for sets of record keys with particular depths and sorting order, which result in inefficient tree shapes, which can cause both large storage overhead, and network amplification in the context of federation streams. To protect against these attacks, implementations should limit the number of TreeEntries per Node to a statistically unlikely maximum length. It may also be necessary to limit the overall depth of the repo, or other parameters, to prevent more sophisticated key mining attacks.

When importing CAR files, the completeness of the repository structure should be verified. Additional unrelated blocks might be included in the CAR structure; care should be taken when injecting CAR contents directly in to backend block storage, to ensure resources are not wasted on un-referenced blocks. There may also be issues with cross-account contamination from CAR imports, for example previously-deleted records re-appearing via CAR import from an unrelated account.


## Possible Future Changes

An optional in-repo mechanism for storing multiple versions of the same record (by path) may be implemented. Eg, adding additional path field to indicate the version by CID, timestamp, or monotonically increasing version integer.

Mechanisms for storing metadata associated with each record are being considered, for example, generic label, re-use rights, or hashtag metadata. This would allow mutating the metadata without mutating the record itself, and make some metadata generic across lexicons.

Repo path restrictions may be relaxed in other ways, including fewer or additional path segments, more allowed characters (including non-ASCII), etc. Paths will always be valid Unicode strings, mapped to MST keys (byte arrays) by UTF-8 encoding.

At the overall atproto specification level, additional "blessed" cryptographic algorithms may be added over time. Likewise, additional CID formats to reference records and blobs may be added. Internal CID format changes would require a repo format version bump.

Repository CAR exports may include linked "blobs" (larger binary files). This might become the default, or a configurable option, or some another mechanism for blob export might be chosen (eg, `.tar` or `.zip` export).

Record content could conceivably be something other than DAG-CBOR some day. This would probably be a repo format version bump. Note that it is possible to efficiently wrap other data formats in a DAG-CBOR wrapper (via a byte array field), or to have a small DAG-CBOR record type that links to a blob in arbitrary format.

Repository CAR exports may end up with a preferred block ordering scheme specified.

The CARv2 file format, which includes optimizations for some use cases, may be adopted in some form.

Adding optional fields to commit and MST node objects may or may not result in a repo format version change. Changing the MST fanout, or any changes to the current MST fields, would be a full repo version change.
