---
title: Authenticated Transfer Protocol (ATP)
summary: The specification for the at:// protocol.
---

# Authenticated Transfer Protocol (ATP)

TODO

The "repository" is a collection of signed records.

It is an implementation of a [Merkle Search Tree (MST)](https://hal.inria.fr/hal-02303490/document). The MST is an ordered, insert-order-independent, deterministic tree. Keys are laid out in alphabetic order. The key insight of an MST is that each key is hashed and starting 0s are counted to determine which layer it falls on (5 zeros for ~32 fanout).

This is a merkle tree, so each subtree is referred to by it's hash (CID). When a leaf is changed, ever tree on the path to that leaf is changed as well, thereby updating the root hash.

## Encodings

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

TODO:

- Are we missing value types? Binary? CID/Link?

### CBOR normalization

TODO: describe normalization algorithm

## Data layout

The data layout establishes the units of network-transmissable data. It includes the following three major groupings:

|Grouping|Description|
|-|-|
|**Repository**|Repositories are the dataset of a single "user" in the ADX network. Every user has a single repository which is identified by a [DID](https://w3c.github.io/did-core/).|
|**Collection**|A collection is an ordered list of records. Every collection is identified by an [NSID](./nsid). Collections only contain records of the type identified by their NSID.|
|**Record**|A record is a key/value document. It is the smallest unit of data which can be transmitted over the network. Every record has a type and is identified by a [TID](#timestamp-ids-tid).|

Every node is an [IPLD](https://ipld.io/) object ([dag-cbor](https://ipld.io/docs/codecs/known/dag-cbor/) to be specific) which is referenced by a [CID](https://github.com/multiformats/cid) hash.

<table>
  <tr>
   <td><strong>Signed Root ("commit")</strong>
   </td>
   <td>The Signed Root, or “commit”, is the topmost node in a repo. It contains:
<ul>

<li><strong>root</strong> The CID of the Root node.

<li><strong>sig</strong> A signature.
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td><strong>Root</strong>
   </td>
   <td>The Root node contains:
<ul>

<li><strong>did</strong> The DID of this repository.

<li><strong>prev</strong> The CID(s) of the previous commit node(s) in this repository’s history.

<li><strong>new_cids</strong> An array of CIDs which were introduced in the write which produced this root.

<li><strong>relationships</strong> The CID of the “Relationships” Standard Collection, a HAMT which encodes the user’s social graph.

<li><strong>namespaces</strong> A map of Namespace nodes where the key is the Namespace’s string ID and the value is its CID.

<li><strong>auth_token</strong> The jwt-encoded UCAN that gives authority to make the write which produced this root.
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td><strong>Namespace</strong>
   </td>
   <td>A Namespace represents a set of schemas which maps to the Collections within it. A Namespace node contains a set of Collections where the key is the Collection’s string ID and the value is its CID.
   </td>
  </tr>
  <tr>
   <td><strong>Collection</strong>
   </td>
   <td>A Collection is a key/value collection which maps a schema-specific key such as a TID or DID to a Record — specifically, to the Record’s CID. The data structures used by Collections are listed below in Collection Data Structures.
   </td>
  </tr>
  <tr>
   <td><strong>Record</strong>
   </td>
   <td>A Record is simply an object. The schema of each Record is determined by the Namespace & Collection it is within.
   </td>
  </tr>
  <tr>
   <td><strong>Standard Collection</strong>
   </td>
   <td>Standard Collections are Collections which exist outside of a Namespace, meaning their schema is encoded into the protocol rather than by applications.
<p>
Currently the following Standard Collections are being used:
<ul>

<li><strong>Relationships</strong>. A list of followed users. 
<ul>
 
<li><strong>did</strong> The DID of the user.
 
<li><strong>username</strong> The username of the user.
</li> 
</ul>
</li> 
</ul>
   </td>
  </tr>
</table>

## Identifiers

The following identifiers are used in repositories:

|Identifier|Usage|
|-|-|
|Username|A domain name which weakly identify repositories.|
|DID|A unique global identifier which strongly identify repositories.|
|TID|A timestamp-based ID which identifies records.|
|Schema ID|An [NSID](./nsid) which identifies record types.|

### Usernames

Usernames are domain names which "weakly" identify repositories. They are a convenience which should be used in UIs but rarely used within records to reference data. See [Name Resolution](/guides/identity) for more information.

The reason that usernames are considered "weak" references is that they may change at any time. Therefore the repo DID is preferred to provide a stable identifier.

### DIDs

DIDs are unique global identifiers which "strongly" identify repositories. They are considered "strong" because they should never change during the lifecycle of a user. They should rarely be used in UIs, but should *always* be used in records to reference data.

ADX supports two DID methods:

- [Web (`did:web`)](https://w3c-ccg.github.io/did-method-web/). Should be used only when the user is "self-hosting" and therefore directly controls the domain name & server. May also be used during testing.
- [Placeholder (`did:plc`)](/specs/did-plc). A method developed in conjunction with ADX to provide global secure IDs which are host-independent.

DIDs resolve to "DID Documents" which provide the address of the repo's host and the public key used to sign the repo's updates.

## Timestamp IDs (TID)

TODO

### Schema IDs

Schemas are identified using [NSIDs](./nsid), a form of [Reverse Domain-Name Notation](https://en.wikipedia.org/wiki/Reverse_domain_name_notation). In the repository, the Schema NSID has many usages:

- In the `$type` field of records to identify its schema.
- To identify collections of records of a given `$type`.
- In permissioning to identify the types of records an application make access.

Some example schema IDs:

```typescript
com.example.profile
io.social.post
net.users.bob.comment
```
