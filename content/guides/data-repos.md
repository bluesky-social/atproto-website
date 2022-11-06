---
title: Personal Data Repositories
summary: A guide to the AT Protocol repo structure.
tldr:
  - A "Data Repository” is a collection of signed data
  - They're like Git repos but for database records
  - Users put their public activity in these repos
---

# Data Repositories

A "Data Repository” is a collection of data published by a single user. Repositories are self-authenticating data structures, meaning each update is signed and can be verified by anyone.

## Data Layout

The content of a repository is laid out in a [Merkle Search Tree (MST)](https://hal.inria.fr/hal-02303490/document) which reduces the state to a single root hash. It can be visualized as the following layout:

<pre style="line-height: 1.2;"><code>┌────────────────┐
│     Commit     │  (Signed Root)
└───────┬────────┘
        ↓
┌────────────────┐
│      Root      │
└───────┬────────┘
        ↓
┌────────────────┐
│   Collection   │
└───────┬────────┘
        ↓
┌────────────────┐
│     Record     │
└────────────────┘
</code></pre>

Every node is an [IPLD](https://ipld.io/) object ([dag-cbor](https://ipld.io/docs/codecs/known/dag-cbor/)) which is referenced by a [CID](https://github.com/multiformats/cid) hash. The arrows in the diagram above represent a CID reference.

This layout is reflected in the URLs:

<pre><code>Root       | at://alice.com
Collection | at://alice.com/app.bsky.feed.post
Record     | at://alice.com/app.bsky.feed.post/1234
</code></pre>

A “commit” to a data repository is simply a keypair signature over a Root node’s CID. Each mutation to the repository produces a new Root node, and every Root node includes the CID of the previous Commit. This produces a linked list which represents the history of changes in a Repository.

<pre style="line-height: 1.2;"><code>┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│     Commit     │  │     Commit     │  │     Commit     │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │     ↑             │     ↑             │
        ↓     └──prev─┐     ↓     └──prev─┐     ↓
┌────────────────┐  ┌─┴──────────────┐  ┌─┴──────────────┐
│      Root      │  │      Root      │  │      Root      │
└────────────────┘  └────────────────┘  └────────────────┘
</code></pre>

## Identifier Types

Multiple types of identifiers are used within a Personal Data Repository.

<table>
  <tr>
   <td><strong>DIDs</strong>
   </td>
   <td><a href="https://w3c.github.io/did-core/">Decentralized IDs (DIDs)</a> identify data repositories. They are broadly used as user IDs, but since every user has one data repository then a DID can be considered a reference to a data repository. The format of a DID varies by the “DID method” used but all DIDs ultimately resolve to a keypair and a list of service providers. This keypair can sign commits to the data repository, or it can authorize UCAN keypairs which then sign commits (see “Permissioning”).
   </td>
  </tr>
  <tr>
   <td><strong>CIDs</strong>
   </td>
   <td><a href="https://github.com/multiformats/cid">Content IDs (CIDs)</a> identify content using a fingerprint hash. They are used throughout the repository to reference the objects (nodes) within it. When a node in the repository changes, its CID also changes. Parents which reference the node must then update their reference, which in turn changes the parent’s CID as well. This chains all the way to the Root node, which is then signed to produce a new commit.
   </td>
  </tr>
  <tr>
   <td><strong>TIDs</strong>
   </td>
   <td>Timestamp IDs (TIDs) identify records. They are used in Collections as a key to Records. TIDs are produced using the local device’s monotonic clock e.g. microseconds since Unix epoch. To reduce the potential for collisions, a 10-bit clockID is appended . The resulting number is encoded as a 13 character string in a sort-order-invariant base32 encoding (`3hgb-r7t-ngir-t4`).
   </td>
  </tr>
</table>
