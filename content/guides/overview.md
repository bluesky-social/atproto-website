---
title: Protocol Overview
summary: An introduction to the at:// protocol.
---

# Authenticated Transport Protocol (ATP) Overview

ATP is a protocol for large-scale distributed social applications. Its goals are to protect users' rights to identity and speech, give creators control over their relationships with their audience, and increase developers' freedom to innovate. 

Five primary specs comprise the v1 of the `at://` protocol. These specs are:

- [Authenticated Transfer Protocol](/specs/atp)
- [Cross-system RPC (XRPC)](/specs/xrpc)
- [Lexicon Schemas](/specs/lexicon)
- [NameSpaced IDs (NSIDs)](/specs/nsid)
- [DID:Placeholder (did:plc)](/specs/did-plc)

These specs can be organize into three layers of dependency:

<pre style="line-height: 1.2;"><code>─────────────────────────────────────────────────────
┌───────────────┐
│  Bsky.app     │  Application semantics
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

[XRPC](/specs/xrpc) is the "bottom-most" layer, acting as an HTTP-based wire protocol for ATP and its applications. Two identifier formats, [NSID](/specs/nsid) and [did:plc](/specs/did-plc), were also required to reference semantic information and repositories respectively. [Lexicon](/specs/lexicon) provides a schemas and semantics system for XRPC methods and data types. [ATP](/specs/atp) is then implemented on top of XRPC, Lexicon, and the other specifications listed.

## Understanding the protocol

ATP's primary purpose is to exchange [signed data repositories](/guides/data-repos). These repositories are collections of user records which include posts, comments, likes, follows, media blobs, and so on. They are signed and addressed by [DIDs](/specs/did-plc), making it possible to authenticate the data at rest (e.g. when sharing posts by other users) and enabling user accounts to migrate to new hosting providers without losing their data or social graph.

ATP uses a federated networking model. Federation was chosen to ensure the network is convenient to use and reliably available. Commands are sent between servers using [HTTPS + XRPC](/specs/xrpc). A global schemas network called [Lexicon](/specs/lexicon) is used to unify the names and behaviors of the calls across the servers. Servers implement "lexicons" to introduce new featuresets, including the [ATP Lexicon](/lexicons/atproto.com) for syncing user repositories.

Personal Data Servers (PDS) are responsible for keeping user data online and for delivering events related to a user's data. They are in many ways the user's personal agent in the network. In addition to hosting and syncing data, the PDS may provide computation and indexing to support specific applications. For example, the reference implementation of the PDS implements the [Bsky.app Lexicon](/lexicons/bsky.app) to provide basic social behaviors.

Client applications are expected to perform minimal computation and indexing as this is provided by the PDS. Likewise, requests for all network content should be sent to the PDS so that it can leverage caches, local indexes, and other optimizations. The PDS is *not* expected to host a GUI, and instead should serve XRPC APIs according to its supported lexicons. This gives the client freedom to render all content according to its preferences. (There are no prohibitions from clients performing local computation or indexing, but the PDS is envisioned as an agent for the user and should therefore be expected to provide these services.)

## Big-world indexing

ATP's design distinguishes between "Small-world" vs "Big-world" networking. The *small-world* behaviors encompass all peerwise relationships: delivery of events targeted at specific users such as mentions, replies, and DMs, and sync of datasets according to follow graphs. The *big-world* behaviors encompass the aggregated activity of the network outside of the user's personal interactions, which tends to include large-scale metrics (likes, reposts, followers), content discovery (algorithms), and user search. 

<pre style="line-height: 1.2;"><code>             ┌──────────────────┐ 
        ┌─ → │ Crawling Indexer │ ← ─┐        (Big world)
        │    └──────────────────┘    │
        │             ↑              │
        ↓             ↓              ↓
    ┌───────┐     ┌───────┐     ┌───────┐ 
    │  PDS  │ ← → │  PDS  │ ← → │  PDS  │     (Small world)
    └───────┘     └───────┘     └───────┘
</code></pre>


ATP's Personal Data Servers are designed to reliably accomplish small-world networking. This means that direct forms of communication should be guaranteed, but visibility into the larger network activity is not guaranteed. For big-world networking, ATP relies on "Crawling Indexers" akin to search engines on the Web. These indexers produce large aggregations of network activity, then serve these aggregations using XRPC APIs under the appropriate lexicons.

The small-world/big-world distinction is intended to achieve scale as well as a high degree of user-choice. As with Web search-engines, users are free to select their big-world indexers. It's likely that most feed algorithms will be modeled as these big-world indexers, and users may therefore select multiple of them to drive their social experience.

## Speech, reach, and moderation

It’s not possible to have a usable social network without moderation. Decentralizing components of existing social networks is about creating a balance that gives users the right to speech, and services the right to provide or deny reach.

Our model is that _speech_ and _reach_ should be two separate layers, built to work with each other. The “speech” layer should remain neutral, distributing authority and designed to ensure everyone has a voice. The “reach” layer lives on top, built for flexibility and designed to scale.

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

The base layer of ATP (Personal Data Repositories and Federated Networking) creates a common space for speech where everyone is free to participate, analogous to the Web where anyone can put up a website. The Crawling Indexer services then enable reach by aggregating content from the network. Moderation occurs in multiple layers through the system, including in aggregation algorithms, thresholds based on reputation, and end-user choice. There's no one company that can decide what gets published; instead there is a marketplace of companies deciding what to carry to their audiences.

Separating speech and reach gives indexing services more freedom to moderate. Moderation by an indexing service doesn't remove a user's identity or destroy their social graph – it only affects the services' own indexes. Users choose their indexers, and so can choose a different service or to supplement with additional services if they're unhappy with the policies of any particular service.

It's important to recognize that hosting providers will be obligated to remove illegal content according to their local laws. To help providers fulfill this obligation, services can publish labels which providers act upon at their discretion.
