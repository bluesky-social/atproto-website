---
title: AT Protocol
summary: The specification for the Authenticated Transfer Protocol (aka "AT Protocol").
wip: true
---

<style>
.api-table {
  border: 1px solid rgb(229, 231, 235);
}
.api-table-head {
  background-color: rgb(243 244 246);
  padding-left: 1rem;
  font-weight: bold;
}
.api-table tr > td:first-child {
  padding-left: 0.5rem;
}
@media(max-width: 500px) {
  .uri-examples tr > td:first-child {
    padding-top: 0.5rem;
  }
  .uri-examples tr > td:last-child {
    padding-bottom: 0.5rem;
  }
  .uri-examples td {
    display: block;
    padding: 0;
  }
}
</style>

# Authenticated Transfer Protocol

## Glossary

- **Client**: The application running on the user's device. Interacts with the network through a PDS.
- **Personal Data Server (PDS)**: A server hosting user data. Acts as the user's personal agent on the network.
- **Name server**. A server mapping domains to DIDs via the `com.atproto.identity.resolveHandle()` API. Often a PDS.
- **Big Graph Service (BGS)**. A service that handles all of your events, like retrieving large-scale metrics (likes, reposts, followers), content discovery (algorithms), and user search.

## Wire protocol (XRPC)

Atproto uses a light wrapper over HTTPS called [XRPC](./xrpc). XRPC uses [Lexicon](./lexicon), a global schema system, to unify behaviors across hosts. The atproto.com lexicons enumerate all XRPC methods used in ATP.

## Identifiers

The following identifiers are used in atproto:

|Identifier|Usage|
|-|-|
|Domain names|A unique global identifier which weakly identify repositories.|
|[DID](https://w3c.github.io/did-core/)|A unique global identifier which strongly identify repositories.|
|[NSID](./nsid)|A unique global identifier which identifies record types and XRPC methods.|
|TID|A timestamp-based ID which identifies records.|

### Domain names

Domain names (aka "handles") weakly identify repositories. They are a convenience which should be used in UIs but rarely used within records to reference data as they may change at any time. The repo DID is preferred to provide a stable identifier.

### DIDs

DIDs are unique global identifiers which strongly identify repositories. They are considered "strong" because they should never change during the lifecycle of a user. They should rarely be used in UIs, but should *always* be used in records to reference data.

Atproto supports two DID methods:

- [Web (`did:web`)](https://w3c-ccg.github.io/did-method-web/). Should be used only when the user is "self-hosting" and therefore directly controls the domain name & server. May also be used during testing.
- [Placeholder (`did:plc`)](/specs/did-plc). A method developed in conjunction with atproto to provide global secure IDs which are host-independent.

DIDs resolve to "DID Documents" which provide the address of the repo's host and the public key used to sign the repo's updates.

### Timestamp IDs (TID)

<div class="todo">Describe TIDs</div>

## URI scheme

Atproto uses the `at://` URI scheme ([specified here](./at-uri-scheme)). Some example `at` URLs:

<table class="uri-examples">
  <tr>
    <td>Repository</td>
    <td><code>at://alice.host.com</code></td>
  </tr>
  <tr>
    <td>Repository</td>
    <td><code>at://did:plc:bv6ggog3tya2z3vxsub7hnal</code></td>
  </tr>
  <tr>
    <td>Collection</td>
    <td><code>at://alice.host.com/io.example.song</code></td>
  </tr>
  <tr>
    <td>Record</td>
    <td><code>at://alice.host.com/io.example.song/3yI5-c1z-cc2p-1a</code></td>
  </tr>
  <tr>
    <td>Record Field</td>
    <td><code>at://bob.com/io.example.song/3yI5-c1z-cc2p-1a#/title</code></td>
  </tr>
</table>

## Schemas

Atproto uses strict schema definitions for XRPC methods and record types. These schemas are identified using [NSIDs](./nsid) and defined using [Lexicon](./lexicon).

## Repositories

A data repository is a collection of signed records.

It is an implementation of a [Merkle Search Tree (MST)](https://hal.inria.fr/hal-02303490/document). The MST is an ordered, insert-order-independent, deterministic tree. Keys are laid out in alphabetic order. The key insight of an MST is that each key is hashed and starting 0s are counted to determine which layer it falls on (5 zeros for ~32 fanout).

This is a Merkle tree, so each subtree is referred to by its hash (CID). When a leaf is changed, every tree on the path to that leaf is changed as well, thereby updating the root hash.

### Repo data layout

<div class="todo">
  Provide a more detailed description of the data layout and how the MST is organized.
</div>

The repository data layout establishes the units of network-transmissible data. It includes the following three major groupings:

|Grouping|Description|
|-|-|
|**Repository**|Repositories are the dataset of a single "user" in the atproto network. Every user has a single repository which is identified by a [DID](https://w3c.github.io/did-core/).|
|**Collection**|A collection is an ordered list of records. Every collection is identified by an [NSID](./nsid). Collections only contain records of the type identified by their NSID.|
|**Record**|A record is a key/value document. It is the smallest unit of data which can be transmitted over the network. Every record has a type and is identified by a [TID](#timestamp-ids-tid).|

Every node is an [IPLD](https://ipld.io/) object ([dag-cbor](https://ipld.io/docs/codecs/known/dag-cbor/) to be specific) which is referenced by a [CID](https://github.com/multiformats/cid) hash.

<table>
  <thead>
    <tr>
      <th>Node Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tr>
    <td><strong>Signed Root ("commit")</strong>
    </td>
    <td>
      The Signed Root, or “commit”, is the topmost node in a repo. It contains:
      <ul>
        <li><strong>root</strong> The CID of the Root node.</li>
        <li><strong>sig</strong> A signature.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><strong>Root</strong>
    </td>
    <td>
      The Root node contains:
      <ul>
        <li><strong>did</strong> The DID of this repository.</li>
        <li><strong>prev</strong> The CID(s) of the previous commit node(s) in this repository’s history.</li>
        <li><strong>data</strong> The Merkle Search Tree topmost node.</li>
        <li><strong>auth_token</strong> The jwt-encoded UCAN that gives authority to make the write which produced this root.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><strong>MST Node</strong>
    </td>
    <td>
      The Merkle Search Tree Nodes contain:
      <ul>
        <li><strong>l</strong> (Optional) The CID of the leftmost subtree.</li>
        <li><strong>e</strong> An array of MST Entries.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td><strong>MST Entry</strong>
    </td>
    <td>
      The Merkle Search Tree Entries contain:
      <ul>
        <li><strong>p</strong> Prefix count of utf-8 chars that this key shares with the prev key.</li>
        <li><strong>k</strong> The rest of the key outside the shared prefix.</li>
        <li><strong>v</strong> The CID of the value of the entry.
        <li><strong>t</strong> (Optional) The CID of the next subtree (to the right of the leaf).</li>
      </ul>
    </td>
  </tr>
</table>

### Repo encodings

All data in the repository is encoded using [CBOR](https://cbor.io/). The following value types are supported:

<table>
  <tr>
    <td><code>null</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.3"> CBOR simple value</a> (major type 7, subtype 24) with a simple value of 22 (null). 
    </td>
  </tr>
  <tr>
    <td><code>boolean</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.3"> CBOR simple value</a> (major type 7, subtype 24) with a simple value of 21 (true) or 20 (false). 
    </td>
  </tr>
  <tr>
    <td><code>integer</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.1"> CBOR integer</a> (major type 0 or 1), choosing the shortest byte representation. 
    </td>
  </tr>
  <tr>
    <td><code>float</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.1"> CBOR floating-point number</a> (major type 7). All floating point values <em>MUST</em> be encoded as 64-bits (additional type value 27), even for integral values.
    </td>
  </tr>
  <tr>
    <td><code>string</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.1"> CBOR string</a> (major type 3).
    </td>
  </tr>
  <tr>
    <td><code>list</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.1"> CBOR array</a> (major type 4), where each element of the list is added, in order, as a value of the array according to its type.
    </td>
  </tr>
  <tr>
    <td><code>map</code>
    </td>
    <td>A<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.1"> CBOR map</a> (major type 5), where each entry is represented as a member of the CBOR map. The entry key is expressed as a<a href="https://datatracker.ietf.org/doc/html/rfc8949#section-3.1"> CBOR string</a> (major type 3) as the key.
    </td>
  </tr>
</table>

<div class="todo">Are we missing value types? Binary? CID/Link?</div>

### Repo CBOR normalization

<div class="todo">Describe normalization algorithm</div>

### Repo records

Repo records are CBOR-encoded objects (using only JSON-compatible CBOR types). Each record has a "type" which is defined by a [lexicon](./lexicon). The type defines which collection will contain the record as well as the expected schema of the record.

The AT Protocol uses dollar (`$`) prefixed fields as system fields. The following fields are given a system-meaning:

|Field|Usage|
|-|-|
|`$type`|Declares the type of a record. (Required on records and Union objects)|

## Client-to-server API

The client-to-server API drives communication between a client application and the user's PDS. The APIs are dictated by the lexicons implemented by the PDS. It's recommended that every PDS support the full [atproto.com lexicon](/lexicons/com-atproto-identity). Application-level lexicons such as [bsky.app](/lexicons/app-bsky-actor) are also recommended.

### Authentication

Authentication is a simple session-oriented process. View the API call in the applications model section of the docs [here](https://atproto.com/guides/applications#signing-in).

#### App passwords
We also have app passwords, an initial solution for authentication that will let users use third-party clients without having to trust them with their primary password. In the long term, we plan add SSO (Single Sign-On) authentication with scoped permissions.

Users can log into third-party apps with an app password in the same way that they login with their account password. App passwords have most of the same abilities as the user's account password, but they're restricted from destructive actions such as account deletion or account migration. They are also restricted from creating additional app passwords.

No client changes are required to adopt app passwords. However, we strongly encourage you to prompt users to use an app password on login and avoid ever entering their password. For account creation, we encourage redirecting a user to the [Bluesky web client](https://bsky.app).

If you expect users have used their primary password with your client, we also strongly encourage you to delete all existing refresh tokens and re-fetch access/refresh tokens using an app password.

App passwords are of the form `xxxx-xxxx-xxxx-xxxx`. For your users' safety, you could run a quick check to ensure that they are logging in with an app password and not their account password.

For users to generate an app password, navigate to Settings > Advanced > App passwords.

### Atproto core lexicon

The com.atproto.* lexicons provides the following behaviors:

- [com.atproto.identity](/lexicons/com-atproto-identity). Handle resolution and changes.
- [com.atproto.server](/lexicons/com-atproto-server). Account and session management.
- [com.atproto.moderation](/lexicons/com-atproto-moderation). Moderation reporting.
- [com.atproto.repo](/lexicons/com-atproto-repo). Repo CRUD operations.
- [com.atproto.sync](/lexicons/com-atproto-sync). Repo content sync and streaming.

### Additional lexicons

For atproto to be practically useful, it needs to support a variety of sophisticated queries and behaviors. While these sophisticated behaviors could be implemented on the user device, doing so would perform more slowly than on the server. Therefore, the PDS is expected to implement lexicons which provide higher-level APIs. The reference PDS created by Bluesky implements the [bsky.app lexicon](/lexicons/bsky-app).

## Server-to-server API

The server-to-server APIs enable federation, event delivery, and global indexing. They may also be used to provide application behaviors such as mail delivery and form submission.

### Authentication

<div class="todo">Describe how servers may authenticate with each other</div>
