---
slug: protocol-checkin-fall-2025
title: Protocol Check-in (Fall 2025)
tags: ['updates']
---

We last shared a protocol roadmap back in [March 2025](https://docs.bsky.app/blog/2025-protocol-roadmap-spring), and wow does time fly. If we're being honest, we haven't tied a bow on as many of these threads as we would've hoped. [Oh time, strength, cash, and patience\!](https://bsky.app/profile/mobydickatsea.bsky.social/post/3m2xhz36kqq2p)

Fortunately, we have more capacity on the team for protocol work than we did even a couple months ago. Expect to see a lot of work start to land in the coming months.

## The Atmosphere is Thriving

Before we dive into what we’re up to, let’s take a moment to celebrate what's happening in the Atmosphere. Our little network is really starting to hit its stride. The energy is incredible and growing by the day\! We're seeing new projects pop up constantly, and there's a new level of maturity across the board.

What's really amazing is watching developers help other developers. Development is happening over on [Tangled](https://tangled.sh/). Devs are sharing updates through [Leaflet](https://leaflet.pub/). Projects like [Slices](http://slices.network/), [Microcosm](https://www.microcosm.blue/), [PDSls](https://pdsls.dev/), and [Graze](https://graze.leaflet.pub/3m33mkloj222o) are making it easier for everyone to build. The AT Protocol Community just announced [the second AtmosphereConf](https://news.atmosphereconf.org/3m3cwwz4mpk2j) this March in Vancouver. This is what decentralized development looks like. Remember: on an open protocol [we can just do things](https://underreacted.leaflet.pub/3m23gqakbqs2j).

## Big Picture

We’re close to a big milestone for the protocol. Think of it as the “AT 1.0 moment” (even if we don’t literally call it that). As we wrap up our protocol work on [auth scopes](https://github.com/bluesky-social/proposals/tree/main/0011-auth-scopes) and [Sync1.1](https://github.com/bluesky-social/proposals/blob/main/0006-sync-iteration/README.md), we believe that we’ve fleshed out a complete set of primitives for working with online identities and public broadcast data. This doesn’t mean that development on new features (i.e. private data) isn’t happening. But we think it’s important that we land and mature the work that we’ve already done around public broadcast data before we move on to the next big chunk of work.

With that in mind, our current focus is on adding a layer of maturity and polish to AT to make it the obvious choice when building public sphere social apps.

We’re pursuing this through three main tracks:

* **Developer Experience**: Making AT fun and easy to work with. Product-focused devs should be able to build a new social app in a weekend.
* **Governance**: Ensuring that AT is something larger and longer-lived than Bluesky
* **Hard Decentralization**: Encouraging the emergence of more stakeholders in the network for a more resilient Atmosphere

## Developer Experience

We know there are rough edges in the developer experience, but we’ve been hard pressed to find the time to smooth them out while also adding new protocol functionality. With a bit of polish, we’re confident that AT can be fun and easy to build on.

### OAuth Cookbooks & Tutorials

OAuth is one of the trickiest parts of building on the protocol — tricky enough that Nick Gerakines is [selling out courses](https://ti.to/ngerakines/atprotocol-oauth-masterclass-fall-2025) on how to do it\! OAuth in general is unfortunately complicated in itself, and the decentralized bits of AT only add to that complexity, but that doesn’t mean that it needs to be unapproachable.

We're taking inspiration from [Auth0](https://auth0.com/)'s approach and putting together some comprehensive examples and tutorials that we hope will make getting started with OAuth way easier. Expect to see these published in the next week or two.

We recently wrapped up our dev work on [auth scopes and permission sets](https://github.com/bluesky-social/proposals/tree/main/0011-auth-scopes). Expect an announcement and guides on how to make use of those shortly.

### Lexicon SDK

Lexicons are the coordination points for schematic data in the network. As more and more applications are publishing new Lexicons, it’s important that developers can actually make use of them to build native integrations between apps.

The current Lexicon SDK was really a prototype that ended up living on way longer than it probably should have. It doesn’t have to be like this. We’re putting together a new SDK that takes inspiration from [Buf](https://buf.build/)’s approach to codegen and schema management. This SDK should make it a breeze to pull in schemas from across the Atmosphere into your application.

### Sync Tool

Repository synchronization is at the core of AT. Every app has to do it. And unfortunately it’s difficult to do and even more difficult to do correctly.

We’re continuing to roll out [Sync1.1](https://github.com/bluesky-social/proposals/tree/main/0006-sync-iteration) on the producer (Relay) side, but a fully spec-compliant consumer for it still doesn’t exist. Most developers currently rely on [Jetstream](https://github.com/bluesky-social/jetstream) to drive their application, but that only helps with live data. There’s no easy way to perform backfill and sync full subsets of the network.

We’re working on a tool that should smooth over the tricky parts of doing sync in AT. This tool will likely take the form of a small service you can run that handles backfill, cutover, cursor management, Sync1.1, and dynamic filtering by DID and collection. That service will do all the tricky stuff and then hand off a nice clean set of record-level operations to your application. It will offer several interfaces including a websocket interface and the ability to translate the firehose into webhooks — meaning AT can work with serverless architectures\!

### Website

We’re going to be giving [atproto.com](http://atproto.com) a facelift in the coming months. You can expect all the work mentioned above to make its appearance there. We’ll also be overhauling the information architecture and publishing new tutorials and guides to make AT more approachable.

## Governance

As the Atmosphere matures and more devs are putting time and resources into building companies/projects in the ecosystem, we believe it’s our responsibility to ensure that the protocol has a neutral long-term governance structure around it. The governance of the protocol should outlive Bluesky and be resilient to shifts in the incentive structure that could compromise a future Bluesky PBC.

To that end, we have 3 major developments:

### Patent Pledge

We announced our [Patent Non-Aggression Pledge](https://bsky.social/about/blog/10-01-2025-patent-pledge) at the start of October. Our SDKs and reference implementations are all open source and licensed under permissive software licenses. This patent pledge takes it a step further and establishes additional assurance around patent rights.

### Independent PLC Organization

We announced in September that we were working to [establish an independent organization](https://docs.bsky.app/blog/plc-directory-org) to operate the PLC (Public Ledger of Credentials) Directory. PLC is the most common identity method for accounts in the Atmosphere.

Currently this directory is owned and operated by Bluesky PBC. We’re working to establish a Swiss association that will operate the directory and own all assets related to PLC (such as the domain name registration). We’re working with lawyers now to get this done right. Expect an update soon on our progress here.

### IETF

We’re hoping to take pieces of [AT to the IETF](https://docs.bsky.app/blog/taking-at-to-ietf). We've submitted [Internet Drafts](https://datatracker.ietf.org/doc/draft-holmgren-at-repository/) on the IETF Datatracker and established a [mailing list](https://mailarchive.ietf.org/arch/browse/atp/). We're hoping to establish a working group and towards that end, have requested a [Birds of a Feather](https://datatracker.ietf.org/doc/bofreq-newbold-authenticated-transfer/) session in Montreal the first week of November. Some folks from the community will be attending and getting together informally. Leave a comment in the [community forum](https://discourse.atprotocol.community/t/update-on-timing-and-plan-for-montreal/164) if you’ll be around. If you're interested in shaping the future of the protocol at the standards level, we encourage you to get involved\!

## Hard Decentralization

Hard decentralization refers to the emergence of a resilient and multi-stakeholder Atmosphere that relies less on Bluesky PBC’s existence. There's some overlap with the other two goals here. Improving things like sync make it easier to run alternate infrastructure like Relays and Appviews, and our governance work should help build confidence that the protocol is a genuine public good that’s larger than Bluesky.

To support the goal of hard decentralization, we're also tackling some specific technical challenges.

### Improving Non-Bluesky PDS Hosting

The decentralization guarantees of AT come from the locked-open substrate of data hosted by Personal Data Servers (PDSes). One of our current goals to increase the resilience of the network is to encourage more non-Bluesky PDS hosting.

We recently [enabled account migration back to bsky.social](https://docs.bsky.app/blog/incoming-migration). We hope this will give users the confidence to experiment with other hosts in the network, knowing they can always migrate back if they need to. Already we’re seeing an [uptick in users posting from non-Bluesky PDSes](https://blue.mackuba.eu/stats/).

Some developers in the network have launched account migration tools that make it easier for non-technical users to migrate between hosts. Examples include [PDS MOOver](https://pdsmoover.com/) and [Tektite](https://tektite.cc/). We believe that the next step is to introduce an account migration UI into the PDS itself.

We also intend to make running a PDS more approachable for mid-size hosts. This includes adding auto-scaling rate limits to the Relay reference implementation so that hosts can scale up organically without needing permission or approval. We’re also looking at ways to improve the PDS distribution to make it easier to run and administer with thousands of users.

### Technical Improvements to PLC

While we’re working to move [PLC](http://plc.directory/) out into an independent organization, we’re also planning some technical improvements to PLC to make it more auditable.

Specifically, we want to make it easier to mirror the directory. We intend to introduce a new WebSocket route to the directory that allows new PLC operations to go out in real time. With this, we’ll also publish a PLC Mirror Service reference implementation. This improves both the auditability of PLC and has operational benefits for developers that may wish to run a PLC Mirror closer to their infrastructure.

There are also some legacy non-spec-compliant operations in the directory that make it difficult to write an alternate implementation of PLC that interoperates with the directory. Upon investigation, these have all been traced back to developers probing the PLC system itself, not regular network accounts. We plan to clean those up and harden the directory against similar operations.

This work is building towards the introduction of Transparency Logs (tlogs). Check out [Sunlight](https://sunlight.dev/) to see where we’re heading. This probably won’t land in the next six months, but it’s the clear next step for improving trust in PLC.

### Alternate Infrastructure

We’re excited to see that more and more devs are experimenting with running alternate infrastructure in the network. [Blacksky](https://blackskyweb.xyz/) currently runs a full-network relay (using the [rksy-relay](https://github.com/blacksky-algorithms/rsky) implementation\!), and is working on a full-network Bluesky appview. Futur showed us all that it was possible with [Zeppelin](https://github.com/zeppelin-social), a full network appview that is now decommissioned. And [Red Dwarf](https://reddwarf.whey.party/) is a new Bluesky client that doesn’t use an Appview but rather drives the experience via direct calls to the PDS and generic indices provided by [Microcosm](https://microcosm.blue/).

Please reach out to us if you’re working on running alternate infrastructure. We’re eager to lend a hand.

## Private Data

We believe that group-private data is absolutely necessary for the long-term success of the protocol and the Atmosphere. Every day, we wish that we had this figured out and developed already. But as mentioned earlier, we believe that we need to land and mature the existing protocol around public broadcast data before we move on to the next big chunk of work.

We continue to have internal discussions around private data. Paul [shared](https://pfrazee.leaflet.pub/3lzhmtognls2q) some [leaflets](https://pfrazee.leaflet.pub/3lzhui2zbxk2b) that give a sense of the approaches that we’re considering and the rubric by which we’re judging them. The AT Protocol Community is also coordinating a [Private Data Working Group](https://discourse.atprotocol.community/t/introductions-and-kick-off/37) to explore some designs for how the system could work.

In the meantime, if you’re building an Atmosphere app, please don’t let the lack of a private data protocol prevent you from building the features that you need to build. Our advice is to publish identities and public data through AT and store any private data that you need on your own server. The semantics of private data will likely look very similar to public data (CRUD operations over a key-value store of typed records, sorted by collection), so if you want to get ahead of the ball, model your data accordingly.

For E2EE DMs, [Germ](https://www.germnetwork.com/) has put together a lovely app built on MLS (Messaging Layer Security) with an AT integration that’s in beta.

## Keep up with the Atmosphere

The Atmosphere is getting bigger every day, and it’s starting to get tough to keep up with everything that’s happening\! Here are some ways to stay in the loop:

* Follow the official [@atproto.com](https://bsky.app/profile/atproto.com) Bluesky account.
* Follow the community-run [@atprotocol.dev](https://bsky.app/profile/atprotocol.dev) account
* Contribute to or read [discussions on Github](https://github.com/bluesky-social/atproto/discussions)
* Check out the [Atmosphere report](https://connectedplaces.leaflet.pub/), an independent newsletter (now on Leaflet\!)
