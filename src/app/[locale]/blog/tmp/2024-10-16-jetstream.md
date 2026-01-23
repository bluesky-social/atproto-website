---
slug: jetstream
title: Introducing Jetstream
tags: ['firehose']
---

One of most popular aspects of atproto for developers is the firehose: an aggregated stream of all the public data updates in the network. Independent developers have used the firehose to build real-time monitoring tools (like [Firesky](https://firesky.tv)), feed generators, labeling services, bots, entire applications, and more.

But the firehose wire format is also one of the more complex parts of atproto, involving decoding binary CBOR data and CAR files, which can be off-putting to new developers. Additionally, the volume of data has increased rapidly as the network has grown, consistently producing hundreds of events per second.

The full synchronization firehose is core network infrastructure and not going anywhere, but to address these concerns we developed an alternative streaming solution, Jetstream, which has a few key advantages:

- simple JSON encoding
- reduced bandwidth, and compression
- ability to filter by collection (NSID) or repo (DID)

A Jetstream server consumes from the firehose and fans out to many subscribers. It is [open source](https://github.com/bluesky-social/jetstream), implemented in Go, simple to self-host. There is an official client library included (in Go), and [community client libraries](https://skyware.js.org/guides/jetstream/introduction/getting-started/) have been developed.

Jetstream was originally written as a side project by one of our engineers, [Jaz](https://bsky.app/profile/jaz.bsky.social). You can read more about their design goals and efficiency gains [on their blog](https://jazco.dev/2024/09/24/jetstream). It has been successful enough that we are promoting it to a team-maintained project, and are running several public instances:

- `jetstream1.us-east.bsky.network`
- `jetstream2.us-east.bsky.network`
- `jetstream1.us-west.bsky.network`
- `jetstream2.us-west.bsky.network`

You can read more technical details about Jetstream in the [Github repo](https://github.com/bluesky-social/jetstream).

## Why Now?

Why are we promoting Jetstream at this time?

Two  factors came to a head in early September: we released an example project for building new applications on atproto ([Statusphere](https://atproto.com/guides/applications)), and we had an unexpectedly large surge in traffic in Brazil. Suddenly we had a situation where new developers would be subscribing to a torrential full-network firehose (over a thousand events per second), just to pluck out a handful of individual events from a handful of accounts. Everything about this continued to function, even on a laptop on a WiFi connection, but it feels a bit wild as an introduction to the protocol.

We knew from early on that while the current firehose is extremely powerful, it was not well-suited to some use cases. Until recently, it hadn’t been a priority to develop alternatives. The firehose is a bit overpowered, but it does Just Work.

Has the Relay encountered scaling problems or become unaffordable to operate?

Nope! The current Relay implementation ('bigsky', written in Go, in the indigo git repo) absorbed a 10x surge in daily event rate, with over 200 active subscribers, and continues to chug along reliably. We have [demonstrated](https://whtwnd.com/bnewbold.net/entries/Notes%20on%20Running%20a%20Full-Network%20atproto%20Relay%20(July%202024)) how even a full-network Relay can be operated affordably.

We do expect to refactor our Relay implementation and make changes to the firehose wire format to support sharding. But the overall network architecture was designed to support global scale and millions of events per second, and we don't see any serious barriers to reaching that size. Bandwidth costs are manageable today. At larger network size (events times subscribers), bandwidth will grow in cost. We expect that the economic value of the network will provide funding and aligned incentives to cover the operation of core network infrastructure, including Relays. In practical terms, we expect funded projects and organizations depending on the firehose to pay infrastructure providers to ensure reliable operation (eg, an SLA), or to operate their own Relay instances.

## Tradeoffs and Use Cases

Jetstream has efficiency and simplicity advantages, but they come with some tradeoffs. We think it is a pragmatic option for many projects, but that developers need to understand what they are getting into.

Events do not include cryptographic signatures or Merkle tree nodes, meaning the data is not self-authenticating. "Authenticated Transfer" is right in the AT Protocol acronym, so this is a pretty big deal! The trust relationship between a Jetstream operator and a consuming client is pretty different from that of a Relay. Not all deployment scenarios and use-cases require verification, and we suspect many projects are already skipping that aspect when consuming from the firehose. If you are running Jetstream locally, or have a tight trust relationship with a service provider, these may be acceptable tradeoffs.

Unlike the firehose (aka, Repository Event Stream), Jetstream is not formally part of the protocol. We are not as committed to maintaining it as a stable API or critical piece of infrastructure long-term, and we anticipate adopting some of the advantages it provides into the protocol firehose over time.

On the plus side, Jetstream is easier and cheaper to operate than a Relay instance. Folks relying on Jetstream can always run their own copy on their own servers.

Some of the use cases we think Jetstream is a good fit for:

- casual, low-stakes projects and social toys: interactive bots, and "fun" badging labelers (eg, [Kiki/Bouba](https://bsky.app/profile/kiki-bouba.mozzius.dev))
- experimentation and prototyping: student projects, proofs of concept, demos
- informal metrics and visualizations
- developing new applications: filtering by collection is particularly helpful when working with new Lexicons and debugging
- internal systems: if you have multiple services consuming from the firehose, a single local Jetstream instance can be used to fan out to multiple subscribers

Some projects it is probably not the right tool for:

- mirroring, backups, and archives
- any time it is important to know "who said what"
- moderation or anti-abuse actions
- research studies

## What Else?

The ergonomics of working with the firehose and "backfilling" bulk data from the network are something we would like to improve in the protocol itself. This might include mechanisms for doing "selective sync" of specific collections within a repo, while still getting full verification of authenticity.

It would be helpful to have a mechanism to identify which repos in the network have any records of a specific type, without inspecting every account individually. For example, enumerating all of the labelers or feed generators in the network. This is particularly important for new applications with a small initial user base.

We are working to complete the atproto specifications for the firehose and for account hosting status.
