---
title: Personal Data Repositories
summary: A guide to the at:// protocol repo structure.
---

# Data Repositories

TODO

A “Personal Data Repository” is a collection of data published by a single user. Repositories are self-authenticating data structures, meaning each update is signed by an authenticated key, includes a proof of that authority, and can have its authenticity verified by anyone through a deterministic algorithm. The content of a repository is laid out in a [Merkle DAG](https://docs.ipfs.io/concepts/merkle-dag/) which reduces the state to a single root hash. This graph of hashes helps quickly compare two repository states which enables more efficient replication protocols.

## Identifier Types

Multiple types of identifiers are used within a Personal Data Repository.

<table>
  <tr>
   <td><strong>DIDs</strong>
   </td>
   <td><a href="https://w3c.github.io/did-core/">Decentralized IDs (DIDs)</a> identify data repositories. They are broadly used as user IDs, but since every user has one data repository then a DID can be considered a reference to a data repository. The format of a DID varies by the “DID method” used but all DIDs ultimately resolve to a keypair and list of service providers. This keypair can sign commits to the data repository, or it can authorize UCAN keypairs which then sign commits (see “Permissioning”).
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

## Data Layout

Each Data Repository is laid out in a Merkle DAG which can be visualized as the following layout:

![Repo hierarchy](/img/overview/repo-hierarchy.png)

Every node is an[ IPLD](https://ipld.io/) object ([dag-cbor](https://ipld.io/docs/codecs/known/dag-cbor/) to be specific) which is referenced by a[ CID](https://github.com/multiformats/cid) hash. The arrows in the diagram above represent a CID reference.

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

## Collection Data Structures

The Collection nodes each use one of the following data structures.

<table>
  <tr>
   <td><strong>HAMT</strong>
   </td>
   <td>A<a href="https://en.wikipedia.org/wiki/Hash_array_mapped_trie"> Hash Array Mapped Trie (HAMT)</a> is a collection which is efficient at lookups but which orders keys by a hash function, thus producing “random” orderings with range queries. They are used for nominal data where order is not useful on the range queries such as the “Relationships” Standard Collection, where DIDs function as the key.
   </td>
  </tr>
  <tr>
   <td><strong>SSTable</strong>
   </td>
   <td>The<a href="https://www.igvita.com/2012/02/06/sstable-and-log-structured-storage-leveldb/"> Sorted String Table (SSTable)</a> is a collection which optimizes both read and write performance at the cost of some periodic book-keeping. Unlike the HAMT, SSTables do maintain a lexicographic ordering of the keys in range queries, making them more useful for ordinal data than the HAMTs. Recent tables are kept small, and as they grow older - and thus less likely to change - they are periodically compacted into larger tables. This is a technique borrowed from log-structured merge trees. By default, Collections use the SSTable with TID keys.
   </td>
  </tr>
</table>

## Permissioning

ATP requires a model for delegating write-authority to the Personal Data Repository so that multiple applications can interact with the user's data. The model chosen is a capabilities-based delegation to keypairs possessed by devices and applications.

All authority for a data repository derives from a master keypair which is declared in the user’s DID document. This key can be thought of as having “Super User” access to the user’s account. That is, it has the authority to do absolutely any action on behalf of the user.

The master keypair requires strong security and should not be duplicated to multiple locations or enter low-security environments such as the browser. This makes it difficult to access every time a new repository commit needs to be produced. Therefore we issue child keypairs from the master keypair in the form of[ UCANs](https://fission.codes/blog/auth-without-backend/), a JWT-style token that contains a permission description. UCANs can prove the authority of some key to undertake a given action, _or_ produce new UCANs with a subset of their authority. Through this mechanism, a user is actually associated with _many_ (likely hundreds) of keys, each belonging to a given context (a device or an application). These keys are granted only the authority they require from the root signing key. 

This leads to a tree of authorized keypairs such as the one in this diagram:

![Key tree](/img/overview/key-tree.png)

## Commits

Every mutation to the repository produces a new Root node because Repositories are[ Merkle DAGs](https://docs.ipfs.io/concepts/merkle-dag/). A “commit” to a data repository is simply a keypair signature over a Root node’s CID.

The signature on a commit may come from the designee of any valid UCAN which belongs to the repository, not just the master keypair. However, the changes that are encoded in the new commit must comply with the permissions given to the UCAN. The UCAN that allows for the change is attached to the root object. Validation of a commit can occur at any node (it is deterministic) but it will often occur at the user’s primary Personal Data Server. Invalid commits should be discarded.

To validate a data repository’s current state, the full history of commits must be validated. This can be accomplished by walking backwards through the “previous commit” pointers. This approach leaves two challenges: UCAN expiry and history compaction. Both of these tasks are under development and may simply rely on periodic checkpoint commits by the user’s master key.

### History

Every Root node includes the CID of the previous Commit. This produces a linked list which represents the history of changes in a Repository.

![Repo history](/img/overview/repo-history.png)

### Validation

Each commit can be validated by doing the following:

- Walk the repo structure to determine what changes were made
- Check that the changes made fall within the permissions of the UCAN attached to the root
- Check that the UCAN is valid (proper attenuation chain, root issuer is the root DID of the account, within time bounds, etc)
- Check that the audience of the UCAN attached to the root matches the public key of the signature in the commit
- Verify that the signature on the commit is a valid signature of the root CID

Full validation of the authenticity of the repo is done by walking backwards through commits and forming the above steps for each write to the repository. This operation will be done very seldomly, as most validators will only be verifying one commit at a time.


### Merges

Merging can be done in two ways:

**Splitting and merging in repo history**: Each root node can refer to _one or more_ previous commits. Therefore, two clients can produce two parallel histories of the repository, and some third actor can merge them together by appending a merge commit that combines the changes from each history. Authorization for these sorts of actions may be tightly scoped such that a personal data server has the authority to perform “repository maintenance” such as merges, but not writes to your repository.

**Forced rebase**: In the event that the data server (or coordinating entity) is unable to perform a merge, it can reject an update from a client that is behind the root. It then forwards the current state of the repository to the client which rebases the changes it made off the current state of the repository.

## Deletions

ATP needs three distinct concepts for removing content from a repository. Sometimes you simply want to indicate that a post represents outdated information. Other times you are trying to clean up leaked data. The different removal scenarios lead to at least these three cases.

### Retractions (soft removal)

The softest of the deletions is the retraction. This is accomplished by adding data to the repository that indicates that a prior record (e.g. a post) is marked as deleted. UX should not show this post but may want to do so when asked. Examples of when a retracted record might be shown is a time travel query, or if there are no results for a query the UX may ask the user if they want to expand the search to deleted and spam posts.

The record and retraction are both considered part of the repository and the repo is not considered a full clone if the retractions are missing. A shallow clone however may want to download only the retractions and not the retracted records.

### Deletions (optional removal)

Deletions are a middle form of a removal. When a record has been deleted, the deletion stays in the repo but the record may be dropped. For this reason the Deletion needs to contain a hash of the record so the older merkle trees can still be validated. It is at the discretion of the server of the repo to either continue storing the deleted data or to compact the repo and remove the data. 

Deleted data should not count against storage quota. This is essentially a “don't care”. If you want to store this data and return it for queries that rely on retracted data that is at the discretion of the host, as the repo is considered complete without this data.

### Purge Requests (hard removal)

Purge Requests are the hard delete of ATP. When a user performs a purge of data from the repo, the records are to be removed entirely. This will require recalculating the merkle tree without this data. The Purge Request itself can be stored in the repo and any host that pulls the latest version of the repo must not serve this data to any future pulls of the repo. This data is not to be included in queries against the repo even in the event of a time travel query or a deleted & spam query. A host should compact the repo on their own storage within a reasonable timeframe. The handling of purge may could be regulated by the contract with a service provider or applicable law in their jurisdiction.

The goal of a purge request is to remove data, but not to cover all evidence that it once existed. Having tombstones that remain after a purge will allow some queries to show that some results have been purged; this is not necessarily considered a purge bug. 

