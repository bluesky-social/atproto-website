---
title: AT Protocol
summary: Specification for the Authenticated Transfer Protocol (AT Protocol)
---

# AT Protocol

The Authenticated Transfer Protocol (AT Protocol or atproto) is a generic federated protocol for building open social media applications. Some recurring themes and features are:

- self-authenticating data and identity, allowing seamless account migrations and redistribution of content
- design for "big world" use cases, scaling to billions of accounts
- delegated authority over application-layer schemas and aggregation infrastructure
- re-use of existing data models from the dweb protocol family and network primitives from the web platform

## Protocol Structure

**Identity:** account control is rooted in stable [DID](/specs/did) identifiers, which can be rapidly resolved to determine the current service provider location and [Cryptographic keys](/specs/cryptography) associated with the account. [Handles](/specs/handle) provide a more human-recognizable and mutable identifier for accounts.

**Data:** public content is stored in content-addressed and cryptographically verifiable [Repositories](/specs/repository). Data records and network messages all conform to a unified [Data Model](/specs/data-model) ([IPLD](https://ipld.io/docs/data-model/), with [CBOR](https://en.wikipedia.org/wiki/CBOR) and JSON representations).

**Network:** HTTP client-server and server-server [APIs](/specs/xrpc) are described with Lexicons, as are WebSocket [Event Streams](/specs/event-stream). Individual records can be referenced across the network by [AT URI](/specs/at-uri-scheme). A Personal Data Server (PDS) acts as an account's trusted agent in the network, routes client network requests, and hosts repositories. A Big Graph Server (BGS) crawls many repositories and outputs a unified event firehose.

**Application:** APIs and record schemas for applications built on atproto are specified in [Lexicons](/specs/lexicon), which are referenced by [Namespaced Identifiers](/specs/nsid) (NSIDs). Application-specific aggregations (such as search) are provided by an Application View (App View) service. Clients can include mobile apps, desktop software, or web interfaces.

The AT Protocol itself does not specify common social media conventions like follows or avatars, leaving these to application-level Lexicons. The `com.atproto.*` Lexicons provide common APIs for things like account signup and login. These could be considered part of AT Protocol itself, though they can also be extended or replaced over time as needed. Bluesky is a microblogging social app built on top of AT Protocol, with lexicons under the `app.bsky.*` namespace.

While atproto borrows several formats and specifications from the IPFS ecosystem (such as IPLD and CID), atproto data does not need to be stored in the IPFS network, and the atproto reference implementation does not use the IPFS network at all, though it would be a reasonable technology for other atproto implementations to adopt.


## Protocol Extension and Applications

AT Protocol was designed from the beginning to balance stability and interoperation against flexibility for third-party application development.

The core protocol extension mechanism is development of new Lexicons under independent namespaces. Lexicons can declare new repository record schemas (stored in collections by NSID), new HTTP API endpoints, and new event stream endpoints and message types. It is also expected that new applications might require new network aggregation services ("AppViews") and client apps (eg, mobile apps or web interfaces).

It is expected that third parties will reuse Lexicons and record data across namespaces. For example, new applications are welcome to build on top of the social graph records specified in the `app.bsky.*` Lexicons, as long as they comply with the schemas controlled by the `bsky.app` authority.

Governance structures for individual Lexicon namespaces are flexible. They could be developed and maintained by volunteer communities, corporations, consortia, academic researchers, funded non-profits, etc.

## What Is Missing?

These specifications cover most details as implemented in Bluesky's reference implementation. A few important pieces have not been finalized, both in that reference implementation and in these specifications.

**Account Migration:** the identity and repository systems were designed to enable easy migration of accounts between PDS service providers, even in the face of a non-cooperative service provider, without impact on the social graph. Some details have not been worked out yet: optional PDS-to-PDS repository transfer; downstream behavior during transfer grace periods; rate-limit norms to prevent network abuse; blob migration; etc.

**Repository History:** the current repository structure and `com.atproto.sync.*` Lexicons include optional links to previous repo commits. The "rebase" mechanism to hard-delete content from repository history has ended up being more complex and computationally expensive than expected. Because this will probably change, the current history mechanism is not specified in detail.

**Repository Event Stream:** the `com.atproto.sync.subscribeRepos` subscription Lexicon is a core part of the protocol and the details need to be described in more detail. This includes the semantics of the "commit" message type, which includes both a "CAR slice" of new repository blocks, and an operation list.

**Blob Export:** the details of how to export and synchronize blobs (aka, images). Blobs are not stored in repositories, though they are linked from repository records.

**Moderation Primitives:** the "label" architecture for distributed moderation has a reference implementation, and is mostly specified in Lexicons (application-level), but has not been described in detail as a unified system. Likewise, the `com.atproto.admin.*` routes for handling moderation reports and doing infrastructure-level take-downs is specified in Lexicons but should also be described in more detail.

**Lexicon Resolution:** an automated way to look up and fetch Lexicon schema definition files for a given type name (NSID)

## Future Work

Smaller changes are described in individual specification documents, but a few large changes span the entire protocol.

**3rd Party Authentication and Authorization:** the intention is to provide a more powerful auth system, both for authentication across services (within atproto), and for "log in with atproto" use cases outside of the ecosystem. This will likely incorporate existing auth standards.

**Non-Public Content:** mechanisms for private group and one-to-one communication will be an entire second phase of protocol development. This encompasses primitives like "private accounts", direct messages, encrypted data, and more. We recommend against simply "bolting on" encryption or private content using the existing protocol primitives.

**Protocol Governance and Formal Standards Process:** The current development focus is to demonstrate all the core protocol features via the reference implementation, including open federation. After that milestone, the intent is to stabilize the lower-level protocol and submit the specification for independent review and revision through a standards body such as the IETF or the W3C.

