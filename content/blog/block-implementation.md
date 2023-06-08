---
title: Why are blocks on Bluesky public?
summary: The technical implementation of public blocks and some possibilities for more privacy preserving block implementations — an area of active research and experimentation. 
date: June 8, 2023
---

# Why are blocks on Bluesky public?
*Published on: June 8, 2023*

In April, we shipped a block feature to all users. Unlike on other centralized platforms, blocks on Bluesky are public and enumerable data, because all servers across the network need to know that they exist in order to respect the user’s request.

The current system of public blocks is just one aspect of our [composable moderation](https://blueskyweb.xyz/blog/4-13-2023-moderation) stack, which we are actively building during our beta period. We’re working on more sophisticated individual and community-level interaction controls and moderation tooling, and we also encourage third-party community developers to contribute to this ecosystem.

In this post, we’ll share the technical implementation of public blocks and discuss some possibilities for more privacy preserving block implementations — an area of active research and experimentation. We welcome community suggestions, so if you have a proposal to share with us on how to implement private blocks after you read this post, please contribute to our public discussion [here](https://github.com/bluesky-social/atproto/discussions/1131).


### What are blocks?

At an abstract level, across many social media platforms, blocks between two accounts usually have the following features:

* **Symmetric:** the behavior is the same regardless of which account initiated a block first
* **Mutual mute:** neither account can read any content (public or private) from the other account, while logged in
* **Mutual interaction block:** direct interactions between the two accounts are not allowed. This includes direct mentions resulting in a notification, replies to posts, direct messages (DMs), and follows (which normally result in notifications).

Blocks add a significant and high-impact degree of friction. There are many cases where this friction alone is sufficient to de-escalate conflict.

However, it is important to note that blocking does not prevent all possible interaction (even on centralized social networks). For example, when content is public, as it is on Bluesky, blogs, or websites, blocked people can still easily access the content by simply logging out or opening an incognito browser tab. Posts can still be screenshotted and shared either on-network or off-network. Harassment can continue to occur even without direct mentions or replies (”subtweeting,” posting screenshots, etc.).

On most existing services, the blockee can detect that they’ve been blocked, though it may not be immediately obvious. For example, if they’re able to navigate to the blocker’s profile, they may see a screen that says they’ve been blocked, or the absence of the profile is indication enough that they have been blocked. Most social apps provide each user with a list of the accounts that they have blocked.

You can read more about blocking behaviors on other platforms:

* Twitter:[ https://help.twitter.com/en/using-twitter/blocking-and-unblocking-accounts](https://help.twitter.com/en/using-twitter/blocking-and-unblocking-accounts)
* Mastodon:[ https://docs.joinmastodon.org/user/moderating/#block](https://docs.joinmastodon.org/user/moderating/#block)
* Instagram:[ https://help.instagram.com/447613741984126](https://help.instagram.com/447613741984126)

### How are blocks currently implemented in Bluesky?

Blocks prevent interaction. Blocked accounts will not be able to like, reply, mention, or follow you, and if they navigate directly to your profile, they will see that they have been blocked. Like other public social networks, if they log out of their account or use a different account, they will be able to view your content. (This much is standard across centralized social networks as well.) 

Currently, on Bluesky, you can view a list of your blocked accounts, and while the list of people who have blocked you is not surfaced in the app, developers familiar with the API could crawl the network to parse this information. This section will dive into the technical constraints that cause blocks to be public, and in a later section, we’ll discuss possible alternative implementations.

Blocks in Bluesky are implemented as part of the `app.bsky.*` application protocol, which builds on top of the underlying AT Protocol (atproto). Blocks are a record stored in account repositories. They look and behave very similarly to “follows”: the `app.bsky.graph.block` and `app.bsky.graph.follow` record schemas are nearly identical.

The block behavior is then implemented by several pieces of software. Servers and clients will index the block records and prevent actions which would have violated the intended behaviors: posts will not appear in feeds and reply threads; profile fetches will be empty or annotated with block state; creation of reply posts, quote posts, embeds, and mentions are blocked; any notifications involving the other account are additionally suppressed.

One of the core principles of the AT Protocol, which Bluesky is built on, is that account holders have total control over their own data. This means that while protocol-compliant clients and servers prevent blocked accounts from creating replies or other disallowed records in each user’s data repository, it is technically possible to bypass those restrictions if a client refuses to be protocol-compliant. The act of being blocked also does not result in any change to the blockee’s repository, and any old replies or mentions remain in place, untouched. For example, in the user-facing app, if someone replies to your post and then you block them, their replies will now be hidden to you. If you later decide to unblock them, their replies to that post will appear again, because the replies themselves were not deleted.

Despite blocks not removing the content of other user’s repositories, the data is not shown because blocks are primarily enforced by other nodes and services — personal data servers (PDS), App Views, and clients. One side effect that comes out of this architecture is that follow relationships are not changed due to a block, and “soft blocks” (rapid block/unblock) do not work as a mechanism to remove a follower. While a follow relationship might still exist in the graph, the block prevents any actual viewing or delivery of content. As future work, we can also ensure that details such as ”like” counts and “follower” accounts are updated when block status changes.

### How will blocks work with open federation?

Bluesky is a public social network built on a protocol to support public conversation, so similar to blogs and websites, you do not need a Bluesky account in order to see content posted to the app. In order to support open federation where many servers, clients, and App Views are collaborating to surface content to users, each account’s data repository — which contains information like follows and blocks — must be public. All of the servers across the network must be able to read the data. Servers must know which accounts you have blocked in order to be able to enforce that relationship.

Once we launch federation there will be many personal data servers (PDS), clients, and App Views. The expectation is that virtually all accounts will be using clients and servers that respect blocking behavior.

It is this need for multiple parties to coordinate that necessitates blocks being public. “Mute” behavior can be implemented entirely in a client app because it only impacts the view of the local account holder. Blocks require coordination and enforcement by other parties, because the views and actions of multiple (possibly antagonistic) parties are involved.

In theory, a bad actor could create their own rogue client or interface which ignores some of the blocking behaviors, since the content is posted to a public network. But showing content or notifications to the person who created the block won’t be possible, as that behavior is controlled by their own PDS and client. It’s technically possible for a rogue client to create replies and mentions, but they would be invisible or at least low-impact to the recipient account for the same reasons. Protocol-compliant software in the ecosystem will keep such content invisible to other accounts on the network. If a significant fraction of accounts elected to use noncompliant rogue infrastructure, we would consider that a failure of the entire ecosystem.

Remember that clever bypasses of the blocking behaviors are already possible on most networks (centralized or not), and it is the added **friction** that matters.

### Are there other ways to implement blocks in federated systems?

Yes, and we are actively exploring other implementations and novel research areas to inform our development on the AT Protocol. We also welcome community suggestions and discussions on this topic.

One example is ActivityPub, which is the protocol that Mastodon is built on. ActivityPub does not require public blocks because content there is not globally public by default — this is also why picking which server you join matters, because it limits the content that you see. Despite this, Mastodon does sometimes [show block information](https://github.com/mastodon/mastodon/issues/11503) to other parties, which is a frequent topic of discussion in the ActivityPub ecosystem.

As we currently understand it, on Mastodon, you only see content when there is an explicit follow relationship between accounts and servers, and follows require mutual consent. (In practice, most follow requests are auto-accepted, so this behavior is not always obvious to end users.) The mutual-mute behavior that blocks require can be implemented on Mastodon by first, disallowing any follows between the two accounts, and second, by adding a regular “mute.”  Similar to Bluesky, the interaction-block behavior relies on enforcement by both the server and the client. So on Mastodon too, it’s possible that a bad actor implements a server that ignores blocks and displays blocked replies in threads. Both ActivityPub and AT Protocol can use de-federation as an enforcement mechanism to disconnect from servers that don’t respect blocks.

### Technical approaches we’ve considered for private blocks

One proposed mechanism to make blocks less public on Bluesky is the use of [bloom filters](https://en.wikipedia.org/wiki/Bloom_filter). The basic idea is to encode block relationships in a statistical data structure, and to distribute that data structure instead of the set of actual blocks. The data structure would make it easy to check if there was a block relationship between two specific accounts, but not make it easy to list all of the blocks. Other servers and clients in the network would then use the data structure to enforce the blocking behaviors. The bloom filters could either be per-account (aka, a bloom filter stored in a record), or per-PDS, or effectively global, with individual PDS instances submitting block relationships to a trusted central service which would publish the bloom filter lists. We considered a scheme like this before implementing blocks, but there are a few issues and concerns:


* **Bloom filters don’t fully prevent enumerating blocks, and if a bad actor was only interested in specific accounts, they could still easily find the list of blocked accounts.** Bloom filters really only add a mask, and it would still be relatively easy to enumerate blocks. While the full matrix of possible block relationships is NxN (where N is the number of accounts in the network, which could ultimately be upwards of hundreds of millions in the future) might be too large to test against, in reality, a bad actor would likely only be targeting prominent accounts or specific communities. In that case, only on the order of billions of possible relationships would need to be tested, which would be trivial on modern hardware.
* **Bloom filters are computationally expensive.** While bloom filters are known for efficiently reducing the storage size for looking up a large number of hashes, they have a large overhead compared to individual hashes. In the context of blocks, every creation or deletion of a block record would potentially require the generation and distribution of a full-sized bloom filter. The storage and bandwidth overhead becomes significant at scale, especially since a significant fraction of social media accounts could have many thousands of blocks.
* **Latency problems persist in mitigations for bloom filter overhead.** The above storage and bandwidth concerns could be mitigated by “batching,” or through a trusted central service. But those solutions have their own problems with latency (time until block is enforced across the network) and trust and reliability (in a central service, which would have the full enumeration of block relationships).

The team is still actively discussing this option, and it’s possible that the extra effort and resources required by bloom filters is worth the imperfect but additional friction that they provide. At the moment, it’s not entirely obvious to us that the tradeoff is worth it. While we’re currently iterating on other moderation and account safety features, we decided to initially release blocks with this simple public system as a first pass.

Some other proposals we’re exploring include:

* **[Label-based block enforcement.](https://github.com/bluesky-social/atproto/discussions/1131#discussioncomment-6066493)** Instead of trying to prevent all violations of blocking relationships across the network, scan for violations of them and label them.
* **[Interaction gating.](https://github.com/bluesky-social/atproto/discussions/1131#discussioncomment-6066516)** Place authority for post threads and quote posts in the original poster’s PDS, so block information doesn’t need to leave that server. 
* **[Zero-knowledge proofs.](https://github.com/bluesky-social/atproto/discussions/1131#discussioncomment-6066535)** We’re aware of existing ZK approaches to distributed blocks, such as [SNARKBlock](https://eprint.iacr.org/2021/1577.pdf), and we’re speaking with trusted advisors about this open area of research and experimentation. Perhaps this research might lead to us deploying a novel system in the future.
* **[Trusted App Views.](https://github.com/bluesky-social/atproto/discussions/1131#discussioncomment-6066568)** Accounts could privately register their blocks with their PDS, and then these servers would forward block metadata to a small number of “blessed” App Views.

If you have experience here or have thoughts about how to implement private block relationships in decentralized systems, we’d love to hear from you. Please contribute to our discussion [here](https://github.com/bluesky-social/atproto/discussions/1131).
