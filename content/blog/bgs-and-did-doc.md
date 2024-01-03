---
title: "Bluesky Relay and DID Document Formatting Changes"
summary:  The Bluesky AppView now consumes from a Bluesky Relay, instead of directly from the PDS. Also, we'll be updating the DID document public key syntax.
date: Oct 6, 2023
---

# Developer Updates: Bluesky Relay and DID Document Formatting Changes
*Published on: Oct 6, 2023*

We have a number of protocol and infrastructure changes rolling out in the next three months, and want to keep everybody in the loop.

*This update was also emailed to the developer mailing list, which you can subscribe to at the bottom of this update.*

## TL;DR

* As of this week, the Bluesky AppView instance now consumes from a Bluesky Relay, instead of directly from the PDS. Devs can access the current streaming API at <code>[https://bsky.network/xrpc/com.atproto.sync.subscribeRepos](https://bsky.network/xrpc/com.atproto.sync.subscribeRepos)</code> or for WebSocket directly, wss://bsky.network/xrpc/com.atproto.sync.subscribeRepos \
Your existing cursor for bsky.social will not be in sync with bsky.network, so check the live stream first to grab a recent seq before connecting!
* We are [updating](https://github.com/bluesky-social/atproto/discussions/1510) the DID document public key syntax to “Multikey” format next week on the main network PLC directory (<code>plc.directory</code>). This change is already live on the sandbox PLC directory.

**How will this affect me?**

* For today, if you're consuming the firehose, grab a *new* cursor from `bsky.network` and restart your firehose consumer pointed at `bsky.network`.

---

## Bluesky Relay

The Bluesky services themselves are moving to a federated deployment, with multiple Bluesky (the company) PDS instances aggregated by a Relay, and the AppView downstream of that. As of yesterday, the Bluesky Appview instance (`api.bsky.app`) consumes from a Bluesky PBC Relay (`bsky.network`), which consumes from the Bluesky PDS (`bsky.social`). Until now, the AppView consumed directly from the PDS.

### How close are we to federation?
Technically, the main network Relay could start consuming from independent PDS instances today, the same as the sandbox Relay does. We have configured it not to do so until we finish implementing some more details, and do our own round of security hardening. If you want to bang on the Relay implementation (written in Go, code in the [indigo github repository](https://github.com/bluesky-social/indigo)), please do so in the [sandbox environment](https://atproto.com/blog/federation-developer-sandbox), not the main network.

### This change impacts devs in two ways:

* In the next couple weeks, new Bluesky (company) PDS instances will appear in the main network. Our plan is to optionally abstract this away for most client developers, so they can continue to connect to `bsky.social` as a virtual PDS. But the actual PDS hostnames will be distinct and will show up in DID documents.
* Firehose consumers (feed generators, mirrors, metrics dashboards, etc) will need to switch over and consume from the Relay instead of the PDS directly. If they do not, they will miss content from the new (Bluesky) PDS instances.

The firehose subscription endpoint, which works as of today, is <code>[https://bsky.network/xrpc/com.atproto.sync.subscribeRepos](https://bsky.network/xrpc/com.atproto.sync.subscribeRepos)</code> (or <code>wss://</code> for WebSocket directly). Note that this endpoint has different sequence numbers. When switching over, we recommend folks consume from both the Relay and PDS for a period to ensure no events are lost, or to scroll back the Relay cursor to ensure there is reasonable overlap in streams.

**We encourage developers and operators to switch to the Relay firehose sooner than later.**

## DID Document Formatting Changes

We also want to remind folks that we are planning to update the DID document public key syntax to “Multikey” format next week on the main network PLC directory (`plc.directory`). These changes are described [here](https://github.com/bluesky-social/atproto/discussions/1510), with example documents for testing, and are live now on the sandbox PLC directory.
