---
title: 2023 Protocol Roadmap
summary: This post lays out the current AT Protocol development plan through the end of 2023
date: October 11, 2023
---

This post lays out the current AT Protocol (atproto) development plan, through to a "version one" release. This document is written for developers already familiar with atproto concepts and terminology. The scope here is features of the underlying protocol itself, not any application or Lexicons on top of the protocol. In particular, this post doesn't describe any product features specific to the Bluesky microblogging application (`app.bsky.*` Lexicons).

At a high level:

* We are pushing towards federation on the production network early next year (2024), if development continues as planned.
* A series of related infrastructure and operational changes to Bluesky services are underway to ensure we can handle a large influx of content from federated instances in a resource and cost-efficient way.
* We plan to submit future governance and formalization of the core protocol to an independent standards body. These are consensus processes relying on interest and support of a community of volunteers, and we have already done some initial outreach, but we expect to start conversations in earnest around the same time as opening up federation.

Feel free to share your thoughts via Github Discussions [here](https://github.com/bluesky-social/atproto/discussions).

<!-- TODO: update link to specific discussion thread just before posting -->

## Getting to Federation

The AT Protocol is designed as a federated social web protocol. While we have an [open federated sandbox network](https://atproto.com/blog/federation-developer-sandbox) for developers to experiment with, the main Bluesky services are currently still not federated. Our current development priority is to resolve any final protocol issues or decisions that would impede federation with independent PDS instances. Some of these points are listed below.

**Account Migration:** One of the differentiating features of atproto is seamless migration of both identity and public content from one PDS instance to another. The foundations for this feature were set in place from the start, but there are some details and behaviors to decide on and document.

**Auth refactor:** We want to improve both third-party auth flows (eg, OAuth2), and to support verifiable inter-service requests (eg, with UCANs). These involve both authentication (“who is this”) and authorization (“what is allowed”). This work will hopefully be a matter of integrating and adapting existing standards. There is a chance that this will be ready in time for federation, but it is not a hard requirement.

**Repo Event Stream (Firehose) Iteration:** A healthy ecosystem of projects has subscribed to the full stream of repo commits that the firehose provides. We have a few improvements and options in mind to help with efficiency and developer experience, without changing the underlying semantics and power dynamic (aka, the ability to replicate all public content). These include "epochs" of sequence numbers; sharding; the option to strip MST nodes ("proof" chain) to reduce bandwidth; and changes to account lifecycle events.

**Third-party Labeling:** This is the protocol-level ability to distribute and subscribe to labels from many sources, including cryptographic signatures for verification. The lexicons are mostly designed, but are not included in the AppView reference implementation, and documentation is needed.

**Account Status Propagation:** Actions like account takedowns and (self) deletions don't currently get broadcast to other parties in the network, though they can be publicly observed (i.e., content becomes inaccessible).Some form of explicit signal would likely be helpful. Additionally, we’d like to allow temporary account deactivation as an option, instead of only account deletion. Temporary deactivation will have behavior similar to an account takedown, with effects propagating through the network. 

**Refactor Moderation Actions:** The `com.atproto.admin.*` Lexicons have a concept of "actions" which "resolve" specific "reports," which has become rigid to work with. A refactor will have more flexible "events" (including both reports and private flags or annotations) which update "subjects." The moderation report submission process should not be impacted, but other admin Lexicons may have breaking changes.

**Legacy Record Cleanup:** We have a short remaining pre-federation window during which we could, in theory, rewrite any records to remove legacy or invalid data. Specifically, we could try to remove all instances of the legacy "blob" schema, and fix many invalid datetimes. This would break a large number of strong references between records, in a way that is difficult to clean up, and would be an aggressive intervention to existing repository content, so there is a good chance this won't actually happen and these crufty records will be in the network forever.

## Operational Changes for Federation

A few infrastructure changes are planned for coming weeks and months that will impact other folks in the ecosystem. We will try to communicate these ahead of time, but are balancing disruption to the existing developer and service ecosystem with federating the network quickly.

**Multiple PDS instances:** The Bluesky PDS (`bsky.social`) is currently a monolithic PostgreSQL database with over a million hosted repositories. We will be splitting accounts across multiple instances, using the protocol itself to help with scaling. Depending on details, this will probably not be very visible to end users or client developers, but will impact firehose consumers and some developers.

**BGS Firehose:** Most folks currently subscribe to the firehose coming from the `bsky.social` PDS directly. We have had a BGS instance running in production for some time, but it has not been promoted and has had occasional downtime. With the move to multiple PDSes, it will still technically be possible to subscribe to multiple individual PDS feeds, but most folks will want to shift to the unified BGS feed instead. This will involve a change in hostname, and the sequence numbers will be different.

**Possible bulk `did:plc` updates:** We are not yet certain when, but there is a good chance that DID documents will need to be updated for all (or a large fraction) of `bsky.social` accounts. This identity churn will be in-spec, but could cause disruptions to other services if they are not prepared.

**Search updates:** The `search.bsky.social` service, which was never a formal part of the Bluesky API (Lexicons) will be deprecated soon, with both actor (profile) and post search possible through `app.bsky.*` Lexicons, served by the AppView (and proxied by the PDS).

**Spam mitigation systems:** Anti-spam efforts will be a crucial part of opening federation. It is not a protocol-level change per-say, but we expect to deploy automated systems to combat spam by labeling posts and accounts at scale.

**Network Growth Control:** We don't have a specific proposal for feedback from the ecosystem yet, but expect to have some form of resource use limits in place as we open federation to prevent the social graph, firehose consumers, and human and technical systems from being overwhelmed.


## New Application Development

Atproto has had a clear system for third-party application development and application-layer protocol extension built in from the beginning: the Lexicon schema system. The current PDS reference implementation restricts record creation for unknown schemas, even when the "skip validation" query parameter is set, but we expect to relax that constraint in coming months.

There is a lot of supporting framework and documentation needed to make atproto a developer-friendly foundation for application development, and a few protocol pieces still need to be worked out:

**Lexicon schema resolution:** There should be a clear automated method for resolving new and unknown NSIDs (schema names) to a Lexicon JSON object over the web.

**Clarify validation failure behaviors:** What each piece of infrastructure is expected to do when records fail to validate against the Lexicon schema needs to be specified in detail, with test cases provided.

**Lexicon schema evolution and extension:** The backwards-compatibility rules for changes to application Lexicon schemas are mostly in place, but they’re not well documented. There is also wiggle room for third parties to inject extension fields into third-party records, and the norms and best practices for this type of extension need documentation.

## Further Down the Road

It is worth mentioning a few parts of the protocol that we do not expect to work on in the near future. We think these are pretty important (which is why we are mentioning them!), but our current priority is federation.

**Private content and messaging (DMs):** We intend to eventually incorporate group-private E2EE (end-to-end encryption) content in the protocol, as well as a robust E2EE messaging solution. These are important and rightfully expected features. We expect this to be a major additional component of atproto, not a simple bolt-on to the current public repository data structure, even if we adopt an existing standard like MLS, Matrix, or the Signal protocol. As a result, this will be a large body of integration work, and will not be a focus until after federation.

**Record versioning:** The low-level protocol allows updates to existing records. It should be possible to store "old" versions of records in the repo, allowing (optional) transparency into history and edits. This may involve additions to repository paths, AT URIs, and core repo read and update endpoints.

**Floating point numbers:** The data model currently only supports integers, not floats. The concerns around floats in content-addressed systems are well documented, and there are alternatives and work-arounds (like string encoding). But if an elegant solution presents itself, it would be nice to support floats as a first-class data type.

**Static CAR file repository hosting:** For many use cases, it would be convenient if atproto repositories could be served as static files (probably CAR files), instead of requiring a full-featured PDS instance.


## Protocol Governance

Development of atproto to date has been driven by a single company, [Bluesky PBC](https://blueskyweb.xyz). Once the network opens to federation, protocol changes and improvements will still be necessary, but will impact multiple organizations, communities, and individuals, each with separate priorities and development interests. If the protocol is successful, there certainly will be disagreements and competitive tensions at play. Having a single company controlling the protocol will not work long-term.

The plan is to bring development and governance of the protocol itself to an established standards body around the time the network opens to federation. Our current hope is to bring this work to the IETF, likely as a new working group, which would probably be a multi-year process. If the IETF does not work out as a home, we will try again with other bodies. While existing work can be proposed exactly “as-is", it is common to have some evolution and breaking changes come out of the standardization processes.

Which parts of the protocol would be in-scope for independent standardization? Like many network protocols, atproto is abstracted into multiple layers, with distinctions between "application-specific" bits and the core protocol. The identity, auth, data model, repositories, streams, and Lexicon schema language are all part of the core protocol, and in-scope for standardization. Some API endpoints under the `com.atproto.*` namespace are also relatively core, and that namespace specifically could fall under independent governance.

Other application-specific APIs and namespaces, including the `app.bsky.*` microblogging application, would not be in-scope for standardization as part of the core protocol. The authority for these APIs and Lexicons is encoded in the name itself, and Bluesky PBC intends to retain control over future development of the `bsky.app` application. The API schemas (Lexicons) will be open, and the expectations and rules for third-party interoperability and extensions for any Lexicon will be part of the core protocol specification.
