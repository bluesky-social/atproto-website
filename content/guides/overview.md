---
title: Protocol Overview
summary: An introduction to the @ Protocol.
tldr:
  - ATP is a federated network
  - Signed data repositories enable account-migration between providers
  - A global schema system called Lexicon creates interoperability
  - Scale is achieved through crawling indexers, similar to Web search engines
---

# Authenticated Transport Protocol (ATP) Overview

ATP is a protocol for large-scale distributed social applications.  Its primary function is to exchange [signed data repositories](/guides/data-repos). These repositories are collections of user records which include posts, comments, likes, follows, media blobs, etc.

ATP syncs the repositories in a federated networking model. Federation was chosen to ensure the network is convenient to use and reliably available. Commands are sent between servers using [HTTPS + XRPC](/specs/xrpc).

## Internet of schematic data

A global schemas network called [Lexicon](/specs/lexicon) is used to unify the names and behaviors of the calls across the servers. Servers implement "lexicons" to support featuresets, including the core [ATP Lexicon](/lexicons/atproto.com) for syncing user repositories and the [Bsky Lexicon](/lexicons/bsky.app) to provide basic social behaviors.

Lexicons unify method-names and record types under a global namespace called [NSIDs](/specs/nsid) which use a reverse-DNS notation. Here are some example methods:

```
com.atproto.repoGetRecord()
com.atproto.syncGetRepo()
app.bsky.getPostThread()
app.bsky.getNotifications()
```

And here are some example record types:

```
app.bsky.post
app.bsky.profile
app.bsky.like
app.bsky.follow
```

These names resolve to [Lexicon Documents](/specs/lexicon) which strictly define the permitted schemas of the records and method inputs/outputs. They are also used to construct semantic URLs, as in these examples:

```
at://alice.com/app.bsky.post/1      - a post by alice.com
at://bob.com/app.bsky.profile/self  - the profile of bob.com
```

Lexicons make it possible to interoperate across services with high confidence of correctness. While the Web exchanges documents, the @ Protocol exchanges schematic and semantic information, enabling the software from different orgs to understand each others' data. This gives ATP clients freedom to produce user interfaces independently of the servers, and removes the need to exchange rendering code (HTML/JS/CSS) while browsing content.

## Achieving scale

ATP distinguishes between "small-world" vs "big-world" networking. *Small-world* networking encompass inter-personal activity while *big-world* networking aggregates activity outside of the user's personal interactions. 

* **Small-world**: delivery of events targeted at specific users such as mentions, replies, and DMs, and sync of datasets according to follow graphs.
* **Big-world**: large-scale metrics (likes, reposts, followers), content discovery (algorithms), and user search.

Personal Data Servers (PDS) are responsible for small-world networking while indexing services separately crawl the network to provide big-world networking.

<pre style="line-height: 1.2;"><code>             ┌──────────────────┐ 
        ┌─ → │ Crawling Indexer │ ← ─┐        (Big world)
        │    └──────────────────┘    │
        │             ↑              │
        ↓             ↓              ↓
    ┌───────┐     ┌───────┐     ┌───────┐ 
    │  PDS  │ ← → │  PDS  │ ← → │  PDS  │     (Small world)
    └───────┘     └───────┘     └───────┘
</code></pre>

The small-world/big-world distinction is intended to achieve scale as well as a high degree of user-choice. As with Web search-engines, users are free to select their big-world indexers. It's likely that most feed algorithms will be modeled as these big-world indexers, and users may therefore select multiple of them to drive their social experience.

## Account portability

We assume that a Personal Data Server may fail at any time, either by going offline in its entirety or by ceasing service for specific users. ATP's goal is to ensure that a user can migrate their account to a new PDS without their involvement.

User data is stored in [signed data repositories](/guides/data-repos) and verified by [DIDs](/guides/identity). DIDs are essentially registries of user certificates, similar in some ways to the TLS certificate system. The are expected to be secure, reliable, a-political, and independent of the users' PDS.

Each DID Document publishes two public keys: a signing key and a recovery key.

* **Signing key**: Asserts changes to the DID Document *and* to the user's data repository.
* **Recovery key**: Asserts changes to the DID Document; may override the signing key within a 72-hour window.

The signing key is entrusted to the PDS so that it can manage the user's data, but the recovery key is saved by the user, eg as a paper key. This makes it possible for the user to update their account to a new PDS without the original host's help. To prevent data loss, the user's data repository is persistently synced to their client as a backup (contingent on the disk space available). Should a PDS disappear without notice, the user should be able to migrate to a new provider by updating their DID Document and uploading the backup.

## Speech, reach, and moderation

The goal of a social network is to provide access to information and people. Its tooling should model a healthy society in which individuals are free from imposition and communities are enabled to self-determine. Decentralization seeks first to disassociate hosting from authority over content, but the design of the protocol has many second-order effects which must be considered.

ATP's model is that _speech_ and _reach_ should be two separate layers, built to work with each other. The “speech” layer should remain neutral, distributing authority and designed to ensure everyone has a voice. The “reach” layer lives on top, built for flexibility and designed to scale.

<pre style="line-height: 1.2;"><code>    ┌────────────────┐
    │  Reach layer   │  Flexible, scaleable
    └─┬─────┬─────┬──┘
      │     │     │
      ↑     ↑     ↑
  Curation and Moderation
      ↑     ↑     ↑ 
      │     │     │
    ┌─┴─────┴─────┴──┐ 
    │  Speech layer  │  Distributed, locked open
    └────────────────┘
</code></pre>

The base layer of ATP (Personal Data Repositories and Federated Networking) creates a common space for speech where everyone is free to participate, analogous to the Web where anyone can put up a website. The Indexing services then enable reach by aggregating content from the network. Curation occurs in multiple layers through the system, including in aggregation algorithms, thresholds based on reputation, and end-user choice. There's no one company that can decide what gets published; instead there is a marketplace of companies deciding what to carry to their audiences.

Separating speech and reach gives indexing services more freedom to curate and moderate. Curation by an indexing service doesn't remove a user's identity or destroy their social graph – it only affects the services' own indexes. Users choose their indexers, and so can choose a different service or to supplement with additional services if they're unhappy with the policies of any particular service.

It's important to recognize that hosting providers will be obligated to remove illegal content according to their local laws. To help providers fulfill this obligation, services can publish labels which providers act upon at their discretion.

## Specifications

Five primary specs comprise the v1 of the @-protocol. These specs are:

- [Authenticated Transfer Protocol](/specs/atp)
- [Cross-system RPC (XRPC)](/specs/xrpc)
- [Lexicon Schemas](/specs/lexicon)
- [NameSpaced IDs (NSIDs)](/specs/nsid)
- [DID:Placeholder (did:plc)](/specs/did-plc)

These specs can be organize into three layers of dependency:

<pre style="line-height: 1.2;"><code>─────────────────────────────────────────────────────
┌───────────────┐
│  Social apps  │
└─┰──────────┰──┘
──╂──────────╂───────────────────────────────────────
  ┃          ▽
  ┃       ┌─────┐
  ┃       │ ATP │  Identity, Block & record storage
  ┃       └──┰──┘
──╂──────────╂───────────────────────────────────────
  ▽          ▽
 ┌────────────┐ 
 │    XRPC    │    Wire protocol
 └────────────┘
 ┌───────┐ ┌─────────┐ ┌─────────┐
 │ NSIDs │ │ Lexicon │ │ did:plc │  Supporting specs
 └───────┘ └─────────┘ └─────────┘
─────────────────────────────────────────────────────
</code></pre>

From here you can continue reading the [high level guides](/guides), read the [individual specs](/specs), or read the [lexicon schemas](/lexicons).