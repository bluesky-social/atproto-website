---
slug: self-host-federation
title: Early Access Federation for Self-Hosters
tags: ['federation', 'guide']
---

_For a high-level introduction to data federation, as well as a comparison to other federated social protocols, check out the [Bluesky blog](https://bsky.social/about/blog/02-22-2024-open-social-web)._

_**Update May 2024:** we have removed the Discord registration requirement, and PDS instances can now connect to the network directly. You are still welcome to join the PDS Admins Discord for community support._

Today, we’re releasing an early-access version of federation intended for self-hosters and developers.

The atproto network is built upon a layer of [self-authenticating](https://bsky.social/about/blog/3-6-2022-a-self-authenticating-social-protocol) data. This foundation is critical to guaranteeing the network’s long term integrity. But the protocol’s openness ultimately flows from a diverse set of hosts broadcasting this data across the network.

Up until now, every user on the network used a Bluesky PDS (Personal Data Server) to host their data. We’ve already federated our own data hosting on the backend, both to help operationally scale our service, and to prove out the technical underpinnings of an openly federated network. But today we’re opening up federation for anyone else to begin connecting with the network.

The PDS, in many ways, fulfills a simple role: it hosts your account and gives you the ability to log in, it holds the signing keys for your data, and it keeps your data online and highly available. Unlike a Mastodon instance, it does not need to function as a full-fledged social media service. We wanted to make atproto data hosting—like web hosting—into a fairly simple commoditized service. The PDS’s role has been limited in scope to achieve this goal. By limiting the scope, the role of a PDS in maintaining an open and fluid data network has become all the more powerful.

We’ve packaged the PDS into a [friendly distribution](https://github.com/bluesky-social/pds) with an installer script that handles much of the complexity of setting up a PDS. After you set up your PDS and join the [PDS Admins Discord](https://discord.gg/UWS6FFdhMe) to submit a request for your PDS to be added to the network, your PDS’s data will get routed to other services in the network (like feed generators and the Bluesky Appview) through our Relay, the firehose provider. Check out our [Federation Overview](https://bsky.social/about/blog/5-5-2023-federation-architecture) for more information on how data flows through the atproto network.

## Early Access Limitations

As with many open systems, Relays will never be totally unconstrained in terms of what data they’re willing to crawl and rebroadcast. To prevent network and resource abuse, it will be necessary to place rate limits on the PDS hosts that they consume data from. As trust and reputation is established with PDS hosts, those rate limits will increase. We’ll gain capacity to increase the baseline rate limits we have in place for new PDSs in the network as we build better tools for detecting and mitigating abuse..

For a smooth transition into a federated network, we’re starting with some lower limits. Specifically, each PDS will be able to host 10 accounts and limited to 1500 evts/hr and 10,000 evts/day. After those limits are surpassed, we’ll stop crawling the PDS until the rate limit period resets. This is intended to keep the network and firehose running smoothly for everyone in the ecosystem.

These are early days, and we have some big changes still planned for the PDS distribution (including the introduction of OAuth!). The software will be updating frequently and things may break. We will not be breaking things indiscriminately. However, in this early period, in order to avoid cruft in the protocol and PDS distribution, we are _not making promises of backwards compatibility._ We _will_ be supporting a migration path for each release, but if you do not keep your PDS distribution up to date, it may break and render the app unusable until you do so.

Because the PDS distribution is not totally settled, we want to have a line of communication with PDS admins in the network, so we’re asking any developer that plans to run a PDS to join the [PDS Admins Discord](https://discord.gg/UWS6FFdhMe). You’ll need to provide the hostname of your PDS and a contact email in order to get your PDS added to the Relay’s allowlist. This Discord will serve as a channel where we can announce updates about the PDS distribution, relay policy, and federation more generally. It will also serve as a community where PDS admins can experiment, chat, and help each other debug issues.

## Account Migration

A major promise of the AT Protocol is the ability to migrate accounts between PDS hosts. This is an important check against potential abuse, and further safeguards the fluid open layer of data hosting that underpins the network.

The PDS distribution that we’re releasing has all of the facilities required to migrate accounts between servers. We’re also opening routes on our PDS that will allow you to migrate your account off our server. However — we do not yet provide the capability to migrate back to the Bluesky PDS, so for the time being, this is a one way street. _Be warned: these migrations involve possibly destructive identity operations_. While we have some guardrails in place, it may still be possible for you to break your account and _we will not be able to help you recover it_. So although it’s technically possible, we do not recommend migrating your main account between servers yet. We especially recommend against doing so if you do not have familiarity with how [DID PLC](https://github.com/did-method-plc/did-method-plc) operations work.

In the coming months we will be hardening this feature and making it safer and easier to do, including creating an in-app flow for moving between servers.

## Getting Started

To get started, join the [PDS Administrators Discord](https://discord.gg/UWS6FFdhMe), and check out the [bluesky-social/pds](https://github.com/bluesky-social/pds) repo on Github. The README will provide all necessary information on getting your PDS setup and running.
