---
slug: introducing-tap
title: "Introducing Tap: Repository Synchronization Made Simple"
---

Just about every app built on AT needs data from a repository at some point. For many use cases – feed generators, labelers, bots – streaming live data through a Relay or Jetstream works well. But some applications need to go beyond what Jetstream was designed for, like tracking specific subsets of a repo, automatically backfilling a database when adding new repos to monitor, or even mirroring the entire Atmosphere.

We recently released [Tap](https://github.com/bluesky-social/indigo/blob/main/cmd/tap/README.md), a tool designed to handle the hard parts of repo synchronization, so you can focus on building your application.

## The Challenge of AT Sync

AT provides two primary mechanisms for syncing repositories: the Relay firehose of real-time events, and direct PDS access to full repos via `com.atproto.sync.getRepo`. Most applications consume events directly from an upstream Relay or Jetstream, and this presents a new set of challenges:

**Backfill is tricky.** When you start tracking a new repo, you likely need to fetch at least some of the current records in that repo, possibly the full repo. Neither the Relay nor Jetstream provides a built-in utility for doing this, leaving it as an exercise for the developer. And once you do have the full backfill, you then need to cut over to fetching live events, requiring careful cursor management to make sure you’re not duplicating or missing data.

**Recovery is fragile.** If your repo gets into a desynchronized state for whatever reason, it’s often hard to recover gracefully. Without some explicit recovery logic, you’ll simply be missing data forever. Cursor management is a tricky affair given the stateless design of the repo event stream making it easier for repos to land in a desynchronized state.

**WebSocket connections aren’t always the right solution.** Currently, syncing requires maintaining a stateful WebSocket connection, which on its own can be hard to manage and requires custom infrastructure separate from most web application stacks. And most serverless platforms don’t have an easy solution for deploying these types of long-lived connections.

**The protocol itself is demanding.** Proper AT involves binary encodings, identity resolution, signature verification, and the semantics of [Sync 1.1](https://github.com/bluesky-social/proposals/tree/main/0006-sync-iteration). [Jetstream was built to make sync more approachable](https://docs.bsky.app/blog/jetstream), but required developers to implicitly trust the output from Jetstream and clients end up trading off the benefits of doing actually authenticated sync.  

## What Tap Does

Put simply, Tap is the all-in-one tool for synchronizing subsets of the Atmosphere, or even creating a full copy of the Atmosphere if you need it. Tap is a single-tenant service, written in Go, that subscribes to a Relay and outputs filtered, verified events of repositories. Think of it as a specialized synchronization tool that sits between the [full network firehose](https://atproto.com/specs/sync#firehose) and your application.

The goal of Tap is to handle the complexity of repo synchronization, with features that manage:

**Automatic backfill.** When you begin tracking a repository, Tap fetches its complete history before delivering live events

**Verification.** Tap handles MST integrity checks, identity signatures, and all the cryptographic validation required by the protocol.

**Recovery.** If a repo becomes desynchronized, Tap automatically resyncs from the authoritative PDS.

**Flexible delivery and connection.** Choose between a WebSocket connection with acknowledgements, fire-and-forget mode, or webhooks for serverless applications.

**Filtered output.** Receive events only for the repositories and collections you care about, delivered as simple JSON.

Here’s a basic workflow to track a single repo:

```shell
# Start Tap (defaults to port 2480, SQLite backend)
go run ./cmd/tap --disable-acks=true

# Connect to receive events
websocat ws://localhost:2480/channel

# Add repositories to track
curl -X POST http;//localhost:2480/repos/add \
  -H "Content-Type: application/json" \
  -d '{"dids": ["did:plc:ewvi7nxzyoun6zhxrhs64oiz"]}'
```

Once you add the repository via the `repos/add` API method, Tap begins backfilling its history automatically. Historical events arrive marked with `live:false`, followed by any buffered live events that occurred during the backfill, and then new events streamed in time marked with `live: true`. Your application receives a complete, ordered view of each repository it subscribes to, without gaps.

## Delivery Guarantees and Ordering

Tap takes on the responsibility of cursor management and provides clear delivery guarantees. Events are delivered **at least once** — if Tap crashes before receiving an event acknowledgment, events will be re-delivered after Tap is restarted. 

Ordering guarantees are per-repo rather than global. For live events from a particular repo, Tap will wait until the previous event is acked before sending the next event. When backfilling or resyncing a repo, Tap will send all processed records concurrently. This design allows a historical backfill to run quickly, while ensuring live events maintain strict ordering.

## Network Boundaries and Filtering

Tap can operate in three modes for determining which repos to track:

**Dynamically configured (default):** Start with zero tracked repositories and add specific DIDs via the `repos/add` endpoint as needed.

**Collection signal mode:** Track all repositories that contain at least one record in a specified collection. Set `TAP_SIGNAL_COLLECTION=com.example.nsid` to automatically discover and track repositories when they create records in your application’s namespace. A common strategy that Atmosphere apps use is to have a “profile” or “declaration” which suggests that a given repo uses that application. For example, Bluesky creates an `app.bsky.actor.profile`  record for all Bluesky users.

**Full network mode:** Track all repositories across the entire network with `TAP_FULL_NETWORK=true`. This is a very resource intensive mode and should only be used if you actually want a complete mirror of the entire Atmosphere\! Expect terabytes of data and days to weeks for the initial backfill. Our benchmarks suggest Tap can handle 35-45k events per second during a full network backfill.

## When to Use Tap

Tap isn’t meant to replace Jetstream for all use cases – if Jetstream is working fine for you, you may not even need Tap. Jetstream isn’t going anywhere\! Since Tap does require more operational overhead, it’s important to understand when you might want to use it with your app:

* Automatic historical backfill when tracking new repositories  
* Native webhook support for serverless architectures  
* Full network backfill and mirroring capabilities for research and analysis  
* Guaranteed delivery with acknowledgement mode  
* For tracking specific subsets of repositories without needing to process the full firehose

Tap is particularly valuable for applications that need precise control over which data they sync, applications that scale up repository tracking (such as social discovery tools), and research or infrastructure projects that require a complete mirror of either the entire or some well-defined subset of the  Atmosphere.

## Full Atmosphere Mirroring as a Principle

One design goal for Tap worth highlighting is that we consider it a failure of AT as an open network if any third party with adequate resources cannot backfill the entire network. This stands in contrast to centralized, monolithic social networks that would typically only offer a real-time event stream, if any firehose access at all, making any kind of longitudinal analysis difficult (or impossible) without special agreements.

Tap makes this philosophical principle practical. The ability to provision an app and maintain your own complete mirror of the Atmosphere enables research, verification, and entire new classes of applications that require historical context. Adding real-time synchronization enables new services built on both historical depth and current data.

## Deployment and Client Integration

Tap is a single Go binary backed by a relational database for managing repo metadata (SQLite by default for simple deployments or Postgres for larger scale apps). Once received, records are handed off to the app to be indexed.

For TypeScript developers, we’re releasing the `@atproto/tap` client library to make consuming Tap events in your TypeScript app even easier. We’re planning  a “typed indexer” that merges this work with the recent Lexicon SDK rewrite, providing end-to-end type safety from protocol and Lexicon definitions to event stream handers.

## Getting Started

Tap is in beta and we welcome you to try it out with your application and let us know if you run into any issues. We’ve included comprehensive documentation in the project [README](https://github.com/bluesky-social/indigo/blob/main/cmd/tap/README.md), a [3-minute deployment guide for Railway](https://github.com/bluesky-social/indigo/blob/main/cmd/tap/RAILWAY_DEPLOY.md), and a [TypeScript library](https://github.com/bluesky-social/atproto/blob/main/packages/tap/README.md) showcasing event handlers.
