---
slug: taking-at-to-ietf
title: Taking AT to the IETF
tags: ['updates', 'ietf']
---

Last week we posted two drafts to the IETF Data Tracker. This is the first major step towards standardizing parts of AT in an effort to establish long-term governance for the protocol.

In particular, we’ve submitted two Internet-Drafts:

[Authenticated Transfer Repository and Synchronization](https://datatracker.ietf.org/doc/draft-holmgren-at-repository/): a proposed standard that specifies the AT repository format and sync semantics

[Authenticated Transfer: Architecture Overview](https://datatracker.ietf.org/doc/draft-newbold-at-architecture/): an informational draft that goes over the architecture of the broader network and describes how the repository fits into it.

Just today, we were approved for a Birds of a Feather (BOF) session at [IETF 124](https://www.ietf.org/meeting/124/) in Montreal from November 1-7. Details on the BOF can be found [Here](https://datatracker.ietf.org/doc/bofreq-newbold-authenticated-transfer/).

A BOF is a part of the formal IETF process for forming a working group. It involves pulling together interested parties in order to determine if the IETF is a good fit for chartering a working group to work on a particular technology.

This is a “non-working group forming” BOF. The intention is to get feedback on both the charter for the WG and the drafts that we’ve submitted. If things go well, then we’d likely do an interim BOF between IETF 124 and 125 to actually form a working group.

## What We’re Planning to Bring (and What We’re Not)

We’re specifically focusing on the repository and sync protocol. We’re not planning to bring Lexicon, AT’s particular OAuth profile, Auth scopes, PLC, the handle system, or other AT components to the IETF right now.

A few reasons for the narrow scope:
- Working groups need focused charters, especially when bringing a new protocol to the IETF
- The repo and sync protocol is the most foundational part of AT and is therefore the most impactful to have under neutral governance
- The repo and sync protocol is the most “IETF-flavored” part of the stack, especially with its reliance on CBOR and WebSockets (both IETF specifications)

If things go well for both sides, we may consider rechartering the working group later. Whether or not a working group forms will not impact how new AT features such as private state are designed or rolled out.

## Why IETF?

This is part of an ongoing effort to mature the governance of AT. (See also: the parallel work that we’re pushing forward on [moving PLC to an independent organization](https://docs.bsky.app/blog/plc-directory-org))

We want AT to have a neutral long-term home, and the IETF seems like a natural fit for several reasons. It’s the home of many internet protocols that you know and use every day: HTTP, TLS, SMTP, OAuth, WebSockets, and many others. The IETF has an open, consensus-driven process that anyone can participate in. And importantly, the IETF cares about both the decentralization of the internet while also keeping it functioning well in practice. This balance between idealism and pragmatism matches how we’ve approached the challenges of building a large-scale decentralized social networking protocol.

## What You Can Do

Read the drafts! Take a look at what we’ve submitted and see what you think. We have a [public GitHub repo](https://github.com/bluesky-social/ietf-drafts) where you can comment on the drafts and provide feedback. We’re hoping to iterate on the drafts at least once before the BOF and already have a few issues noted that we need to address.

If you’re planning to attend IETF 124 in Montreal, let us know! We’d love to connect with folks who are interested in this work.
