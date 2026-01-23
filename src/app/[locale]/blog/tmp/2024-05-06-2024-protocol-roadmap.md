---
slug: 2024-protocol-roadmap
title: 2024 Protocol Roadmap
tags: ['updates']
---

_Discuss this post in our Github Discussion forums [here](https://github.com/bluesky-social/atproto/discussions/2469)_

This roadmap is an update on our progress and lays out our general goals and focus for the coming months. This document is written for developers working on atproto clients, implementations, and applications (including Bluesky-specific projects). This is not a product announcement: while some product features are hinted at, we aren't promising specific timelines here. As always, most Bluesky software is free and open source, and observant folks can follow along with our progress week by week in GitHub.

In the big picture, we made a lot of progress on the protocol in early 2024. We opened up federation on the production network, demonstrated account migration, specified and launched stackable moderation (labeling and Ozone), shared our plan for OAuth, specified a generic proxying mechanism, built a new API documentation website (docs.bsky.app), and more.

After this big push on the protocol, the Bluesky engineering team is spending a few months catching up on some long-requested features like GIFs, video, and DMs. At the same time, we do have a few "enabling" pieces of protocol work underway, and continue to make progress towards a milestone of protocol maturity and stability.

Summary-level notes:

- Federation is now open: you don't need to pre-register in Discord any more.
- It is increasingly possible to build independent apps and integrations on atproto. One early example is https://whtwnd.com/, a blogging web app built on atproto.
- The timeline for a formal standards body process is being pushed back until we have additional independent active projects building on the protocol.

## Current Work

**Proxying of Independent Lexicons:** earlier this year we added a [generic HTTP proxying mechanism](https://atproto.com/specs/xrpc#service-proxying), which allows clients to specify which onward service (eg, AppView) instance they want to communicate with. To date this has been limited to known Lexicons, but we will soon relax this restriction and make arbitrary XRPC query and procedure requests. Combined with allowing records with independent Lexicon schemas (now allowed), this finally enables building new independent atproto applications. [PR for this work](https://github.com/bluesky-social/atproto/pull/2425)

**Open Federation:** the Bluesky Relay service initially required pre-registration before new PDS instances were crawled. This was a very informal process (using Discord) to prevent automated abuse, but we have removed this requirement, making it even easier to set up PDS instances. We will also bump the per-PDS account limits, though we will still enforce some limits to minimize automated abuse; these limits can be bumped for rapidly growing communities and projects.

**Email 2FA:** while OAuth is our main focus for improving account security (OAuth flows will enable arbitrary MFA, including passkeys, hardware tokens, authenticators, etc), we are rapidly rolling out a basic form of 2FA, using an emailed code in addition to account password for sign-in. This will be an optional opt-in functionality. [Announcement with details](https://github.com/bluesky-social/atproto/discussions/2435)

**OAuth:** we continue to make progress implementing our plan for OAuth. Ultimately this will completely replace the current account sign-up, session, and app-password API endpoints, though we will maintain backwards compatibility for a long period. With OAuth, account lifecycle, sign-in, and permission flows will be implementation-specific web views. This means that PDS implementations can add any sign-up screening or MFA methods they see fit, without needing support in the `com.atproto.*` Lexicons. [Detailed Proposal](https://github.com/bluesky-social/proposals/tree/main/0004-oauth)

## Product Features

These are not directly protocol-related, but are likely to impact many developers, so we wanted to give a heads up on these.

**Harassment Mitigations:** additional controls and mechanisms to reduce the prevalence, visibility, and impact of abusive mentions and replies, particularly coming from newly created single-purpose or throw-away accounts. May expand on the existing thread-gating and reply-gating functionality.

**Post Embeds:** the ability to embed Bluesky posts in external public websites. Including oEmbed support. This has already shipped! See [embed.bsky.app](https://embed.bsky.app)

**Basic "Off-Protocol" Direct Messages (DMs):** having some mechanism to privately contact other Bluesky accounts is the most requested product feature. We looked closely at alternatives like linking to external services, re-using an existing protocol like Matrix, or rushing out on-protocol encrypted DMs, but ultimately decided to launch a basic centralized system to take the time pressure off our team and make our user community happy. We intend to iterate and fully support E2EE DMs as part of atproto itself, without a centralized service, and will take the time to get the user experience, security, and privacy polished. This will be a distinct part of the protocol from the repository abstraction, which is only used for public content.

**Better GIF and Video support:** the first step is improving embeds from external platforms (like Tenor for GIFs, and YouTube for video). Both the post-creation flow and embed-view experience will be improved.

**Feed Interaction Metrics:** feed services currently have no feedback on how users are interacting with the content that they curate. There is no way for users to tell specific feeds that they want to see more or less of certain kinds of content, or whether they have already seen content. We are adding a new endpoint for clients to submit behavior metrics to feed generators as a feedback mechanism. This feedback will be most useful for personalized feeds, and less useful for topic or community-oriented feeds. It also raises privacy and efficiency concerns, so sending of this metadata will both be controlled by clients (optional), and will require feed generator opt-in in the feed declaration record.

**Topic/Community Feeds:** one of the more common uses for feed generators is to categorize content by topic or community. These feeds are not personalized (they look the same to all users), are not particularly "algorithmic" (posts are either in the feed or not), and often have relatively clear inclusion criteria (though they may be additionally curated or filtered). We are exploring ways to make it easier to create, curate, and explore this type of feed.

**User/Labeler Messaging:** currently, independent moderators have no private mechanism to communicate with accounts which have reported content, or account which moderation actions have been taken against. All reports, including appeals, are uni-directional, and accounts have no record of the reports they have submitted. While Bluesky can send notification emails to accounts hosted on our own PDS instance, this does not work cross-provider with self-hosted PDS instances or independent labelers.

## Protocol Stability Milestone

A lot of progress has been made in recent months on the parts of the protocol relevant to large-scale public conversation. The core concepts of autonomous identity (DIDs and handles), self-certifying data (repositories), content curation (feed generators), and stackable moderation (labelers) have now all been demonstrated on the live network.

While we will continue to make progress on additional objectives (see below), we feel we are approaching a milestone in development and stability of these components of the protocol. There are a few smaller tasks to resolve towards this milestone.

**Takedowns:** we have a written proposal for how content and account takedowns will work across different pieces of infrastructure in the network. Takedowns are a stronger intervention that complement the labeling system. Bluesky already has mechanisms to enact takedowns on our own infrastructure when needed, but there are some details of how inter-provider takedown requests are communicated.

**Remaining Written Specifications:** a few parts of the protocol have not been written up in the specifications at atproto.com.

**Guidance on Building Apps and Integrations:** while we hope the protocol will be adopted and built upon in unexpected ways, it would be helpful to have some basic pointers and advice on creating new applications and integrations. These will probably be informal tutorials and example code to start.

**Account and Identity Firehose Events:** while account and identity state are authoritatively managed across the DID, DNS, and PDS systems, it is efficient and helpful for changes to this state to be broadcast over the repository event stream ("firehose"). The semantics and behavior of the existing `#identity` event type will be updated and clarified, and an additional `#account` event type will be added to communicate PDS account deletion and takedown state to downstream services (Relay, and on to AppView, feed generator, labelers, etc). Downstream services might still need to resolve state from an authoritative source after being notified on the firehose.

**Private Account Data Iteration:** the `app.bsky` Lexicons currently include a preferences API, as well as some additional private state like mutes. The design of the current API is somewhat error-prone, difficult for independent developers to extend, and has unclear expectations around providing access to service providers (like independent AppViews). We are planning to iterate on this API, though it might not end up part of the near-term protocol milestone.

**Protocol Tech Debt:** there are a few other small technical issues to resolve or clean up; these are tracked in [this GitHub discussion](https://github.com/bluesky-social/atproto/discussions/2128)

## On the Horizon

There are a few other pieces of protocol work which we are starting to plan out, but which are not currently scheduled to complete in 2024. It is very possible that priorities and schedules will be shuffled, but we mostly want to call these out as things we do want to complete, but will take a bit more time.

**Protocol-Native DMs:** as mentioned above, we want to have a "proper" DM solution as part of atproto, which is decentralized, E2EE, and follows modern security best practices.

**Limited-Audience (Non-Public) Content:** to start, we have prioritized the large-scale public conversation use cases in our protocol design, centered around the public data repository concept. While we support using the right tool for the job, and atproto is not trying to encompass every possible social modality, there are many situations and use-cases where having limited-audience content in the same overall application would be helpful. We intend to build a mechanism for group-private content sharing. It will likely be distinct from public data repositories and the Relay/firehose mechanism, but retain other parts of the protocol stack.

**Firehose Bandwidth Efficiency:** as the network grows, and the volume and rate of repository commits increases, the cost of subscribing to the entire Relay firehose increases. There are a number of ways to significantly improve bandwidth requirements: removing MST metadata for most use-cases; filtering by record types or subsets of accounts; batch compression; etc.

**Record Versioning (Post Editing):** atproto already supports updating records in repositories: one example is updating bsky profile records. And preparations were made early in the protocol design to support post editing while avoiding misleading edits. Ideally, it would also be possible to (optionally) keep old versions of records around in the repository, and allow referencing and accessing multiple versions of the same record.

**PLC Transparency Log:** we are exploring technical and organizational mechanisms to further de-centralize the DID PLC directory service. The most promising next step looks to be publishing a transparency log of all directory operations. This will make it easier for other organizations to audit the behavior of the directory and maintain verifiable replicas. The recent "tiling" transparency log design used for [https://sunlight.dev/](https://sunlight.dev/) ([described here](https://filippo.io/a-different-CT-log)) is particularly promising. Compatibility with [RFC 6962 (Certificate Transparency)](https://www.rfc-editor.org/rfc/rfc6962) could allow future integration with an existing ecosystem of witnesses and auditors.

**Identity Key Self-Management UX:** the DID PLC system has a concept of "rotation keys" to control the identity itself (in the form of the DID document). We would like to make it possible for users to optionally register additional keys on their personal devices, password managers, or hardware security keys. If done right, this should improve the resilience of the system and reduce some of the burden of responsibility on PDS operators. While this is technically possible today, it will require careful product design and security review to make this a safe and widely-adopted option.

## Standards Body Timeline

As described in our [2023 Protocol Roadmap](https://docs.bsky.app/blog/protocol-roadmap#protocol-governance), we hope to bring atproto to an existing standards body to solidify governance and interoperability of the lower levels of the protocol. We had planned to start the formal process this summer, but as we talked to more people experienced with this process, we realized that we should wait until the design of the protocol has been explored by more developers. It would be ideal to have a couple organizations with atproto experience collaborate on the standards process together. If you are interested in being part of the atproto standards process, leave a message in [the discussion thread for this post](https://github.com/bluesky-social/atproto/discussions/2469), or email `protocol@blueskyweb.xyz`.

While there has been a flowering of many projects built around the `app.bsky` microblogging application, there have been very few additional Lexicons and applications built from scratch. Some of this stemmed from restrictions on data schemas and proxying behavior on the Bluesky-hosted PDS instances, only relaxed just recently. We hope that new apps and Lexicons will exercise the full capabilities and corner-cases of the protocol.

We will continue to participate in adjacent standards efforts to make connections and get experience. Bluesky staff will attend [IETF 120 in July](https://www.ietf.org/meeting/120/), and are always happy to discuss responsible DNS integrations, OAuth, and HTTP API best practices.
