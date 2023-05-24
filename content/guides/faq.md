---
title: FAQ
summary: Frequently Asked Questions about ATP
---

# FAQ

Frequently Asked Questions about the Authenticated Transfer Protocol (ATP). For FAQ about Bluesky, visit [here](https://blueskyweb.xyz/faq).

## Is the AT Protocol a blockchain?

No. The AT Protocol is a [federated protocol](https://en.wikipedia.org/wiki/Federation_(information_technology)). It's not a blockchain nor does it use a blockchain.

## Why not use ActivityPub?

[ActivityPub](https://en.wikipedia.org/wiki/ActivityPub) is a federated social networking technology popularized by [Mastodon](https://joinmastodon.org/).

Account portability is the major reason why we chose to build a separate protocol. We consider portability to be crucial because it protects users from sudden bans, server shutdowns, and policy disagreements. Our solution for portability requires both [signed data repositories](/guides/data-repos) and [DIDs](/guides/identity), neither of which are easy to retrofit into ActivityPub. The migration tools for ActivityPub are comparatively limited; they require the original server to provide a redirect and cannot migrate the user's previous data.

Other smaller differences include: a different viewpoint about how schemas should be handled, a preference for domain usernames over AP’s double-@ email usernames, and the goal of having large scale search and discovery (rather than the hashtag style of discovery that ActivityPub favors).

## Why create Lexicon instead of using JSON-LD or RDF?

Atproto exchanges data and RPC commands across organizations. For the data and RPC to be useful, the software needs to correctly handle schemas created by separate teams. This is the purpose of [Lexicon](/guides/lexicon).

We want engineers to feel comfortable using and creating new schemas, and we want developers to enjoy the DX of the system. Lexicon helps us produce strongly typed APIs which are extremely familiar to developers and which provides a variety of runtime correctness checks (which are vital in distributed systems).

[RDF](https://en.wikipedia.org/wiki/Resource_Description_Framework) is intended for extremely general cases in which the systems share very little infrastructure. It’s conceptually elegant but difficult to use, often adding a lot of syntax which devs don't understand. JSON-LD simplifies the task of consuming RDF vocabularies, but it does so by hiding the underlying concepts, not by making RDF more legible.

We looked very closely at using RDF but just didn't love the developer experience (DX) or the tooling it offered.

## What is “XRPC,” and why not use ___?

[XRPC](/specs/xrpc) is HTTP with some added conventions.

XRPC uses [Lexicon](/guides/lexicon) to describe HTTP calls and maps them to `/xrpc/{methodId}`. For example, this API call:

```typescript
await api.com.atproto.repo.listRecords({
  user: 'alice.com',
  collection: 'app.bsky.feed.post'
})
```

...maps to:

```text
GET /xrpc/com.atproto.repo.listRecords
  ?user=alice.com
  &collection=app.bsky.feed.post
```

Lexicon establishes a shared method id (`com.atproto.repo.listRecords`) and the expected query params, input body, and output body. By using Lexicon we get runtime checks on the inputs and outputs of the call, and can generate typed code like the API call example above.
