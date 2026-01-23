---
slug: pinned-posts
title: Lexicons, Pinned Posts, and Interoperability
tags: ['lexicon', 'interop']
---

As the AT Protocol matures, developers are building alternative Bluesky clients and entirely novel applications with independent Lexicions. We love to see it! This is very aligned with our vision for the ATmosphere, and we intend to encourage more of this through additional developer documentation and tooling.

One of the major components of the protocol is the concept of "Lexicons," which are machine-readable schemas for both API endpoints and data records. The goal with Lexicons is to make it possible for independent projects to work with the same data types reliably. Users should be able to choose which software they use to interact with the network, and it is important that developers are able to call shared APIs and write shared data records with confidence.

While the Lexicon concept has been baked into the protocol from the beginning, some aspects are still being finalized, and best practices around extensions, collaboration, and governance are still being explored.

A recent incident in the live network brought many of these abstract threads into focus. Because norms and precedent are still being established, we thought it would be good to dig into the specific situation and give some updates.

### What Happened?

On October 10, Bluesky released version 1.92 of our main app. This release added support for "pinned posts," a long-requested feature. This update added a `pinnedPost` field to the `app.bsky.actor.profile` record. This [field is declared](https://github.com/bluesky-social/atproto/blob/2676206e422233fefbf2d9d182e8d462f0957c93/lexicons/app/bsky/actor/profile.json#L44) as a `com.atproto.repo.strongRef`, which is an object containing both the URL and a hash (CID) of the referenced data record.

<!-- EMBED v1.92 announcement: https://bsky.app/profile/bsky.app/post/3l66vf2q4pi26 -->
<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3l66vf2q4pi26" data-bluesky-cid="bafyreibonvobqqubi5aklhvd3t56utmp6yf5c5riifd4lobowdwi6sayei"><p lang="en">📢 App Version 1.92 is rolling out now (1/5)Pinned posts are here! Plus lots of UI improvements, including new font options, and the ability to filter your searches by language.Open this thread for more details. 🧵<br/><br/><a href="https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/post/3l66vf2q4pi26?ref_src=embed">[image or embed]</a></p>&mdash; Bluesky (<a href="https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur?ref_src=embed">@bsky.app</a>) <a href="https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/post/3l66vf2q4pi26?ref_src=embed">Oct 10, 2024 at 3:24 PM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

All the way back in April 2024, independent developers had _already_ implemented pinned posts in a handful of client apps. They did so by using a `pinnedPost` field on the `app.bsky.actor.profile` record, as a simple string URL. This worked fine for several months, and multiple separate client apps ([Klearsky](https://klearsky.pages), [Tokimeki](https://tokimeki.blue), and [Hagoromo](https://hagoromo.relog.tech)) collaborated informally and used this same extension of the profile record type.

<!-- EMBED April 2024: original note https://bsky.app/profile/mimonelu.net/post/3krbslukrq22k -->
<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:ilxxgyz7oz7mysber4omeqrg/app.bsky.feed.post/3krbslukrq22k" data-bluesky-cid="bafyreig3vaklphdozmgby4b4v7ggvxfs764diu4mtveifzxlamj2gcvchi"><p lang="ja">やっていることは簡単で、 app.bsky.actor.profile に pinnedPost というカスタムフィールドを作り、これにポストのAT URIを設定しているだけ…なんですが getProfile がカスタムフィールドを返してくれない（それはそう）のがちょっとあれでまだ調整中です</p>&mdash; mimonelu 🦀 みもねる (<a href="https://bsky.app/profile/did:plc:ilxxgyz7oz7mysber4omeqrg?ref_src=embed">@mimonelu.net</a>) <a href="https://bsky.app/profile/did:plc:ilxxgyz7oz7mysber4omeqrg/post/3krbslukrq22k?ref_src=embed">Apr 29, 2024 at 8:45 AM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

One of the interesting dynamics was that multiple independent Bluesky apps were collaborating to use the same extension field.

<!-- EMBED: https://bsky.app/profile/l-tan.blue/post/3krlxdxdfdd2w -->
<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:qcruz6j42vap6uhur4yeisef/app.bsky.feed.post/3krlxdxdfdd2w" data-bluesky-cid="bafyreiaple5g5a6s6e37ufsn3ykfrn776ijmfrwnmpy7u4nf6gf37tryha"><p lang="ja">Blueskyクライアントの一覧を更新しました！🆕Features!PinnedPost (3rd party non-official feature)・Klearsky・TOKIMEKI・羽衣-Hagoromo-<br/><br/><a href="https://bsky.app/profile/did:plc:qcruz6j42vap6uhur4yeisef/post/3krlxdxdfdd2w?ref_src=embed">[image or embed]</a></p>&mdash; どるちぇ (<a href="https://bsky.app/profile/did:plc:qcruz6j42vap6uhur4yeisef?ref_src=embed">@l-tan.blue</a>) <a href="https://bsky.app/profile/did:plc:qcruz6j42vap6uhur4yeisef/post/3krlxdxdfdd2w?ref_src=embed">May 3, 2024 at 9:36 AM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

Which all worked great! Until the Bluesky update conflicted with the existing records, causing errors for some users. Under the new schema, the previously-written records suddenly became "invalid". And new records, valid under the new schema, could be invalid from the perspective of independent software.

### Analysis

The issue with conflicting records was an unintentional mistake on our part. While we knew that other apps had experimented with pinned posts, and separately knew that conflicts with Lexicon extension fields were possible in theory, we didn't check or ask around for feedback when updating the profile schema. While the Bluesky app is open-source and this new schema had even been discussed by developers in the app ahead of time, we didn't realize we had a name collision until the app update was shipped out to millions of users. If we had known about the name collision in advance, we would have chosen a different field name or worked with the dev community to resolve the issue.

There has not been clear guidance to developers about how to interoperate with and extend Lexicons defined by others. While we have discussed these questions publicly a few times, the specifications are somewhat buried, and we are just starting to document guidance and best practices.

At the heart of this situation is a tension over who controls and maintains Lexicions. The design of the system is that authority is rooted in the domain name corresponding to the schema NSID (in reverse notation). In this example, the app.bsky.actor.profile schema is controlled by the owners of bsky.app – the Bluesky team. Ideally schema maintainers will collaborate with other developers to update the authoritative schemas with additional fields as needed.

There is some flexibility in the validation rules to allow forwards-compatible evolution of schemas. Off-schema attributes can be inserted, ignored during schema validation, and passed through to downstream clients. Consequently it’s possible (and acceptable) for other clients to use off-schema attributes, which is the situation that happened here.

While this specific case resulted in interoperability problems, we want to point out that these same apps are separately demonstrating a strong form of interoperation by including data from multiple schemas (whtwnd.com, linkat.blue, etc) all in a single app. This is exactly the kind of robust data reuse and collaboration we hoped the Lexicon system would enable.

<!-- EMBED: https://bsky.app/profile/tokimeki.blue/post/3l67oc7d2pq27 -->
<blockquote class="bluesky-embed" data-bluesky-uri="at://did:plc:4tr5dqti7nmu6g2czpthntak/app.bsky.feed.post/3l67oc7d2pq27" data-bluesky-cid="bafyreieopijbllr7ydxjxa5gsba2cyba3wrmnzhmdourpzcqfqsu2kef2y"><p lang="ja">🌈 TOKIMEKI UPDATE!!!(Web/Android v1.3.5/iOS TF)🆕 プロフィール画面に Atmosphere スペースを追加！- AT Protocol では Bluesky 以外にも様々なサービスを自由に開発することができ、実際にいくつかの便利なサービスが公開されています。- ユーザーが利用しているBluesky以外のサービスへのリンクを見ることができます。- 現在は、Linkat (リンク集) と WhiteWind (ブログ) の2つに対応。- 設定→全般から非表示にできます。Web | Android<br/><br/><a href="https://bsky.app/profile/did:plc:4tr5dqti7nmu6g2czpthntak/post/3l67oc7d2pq27?ref_src=embed">[image or embed]</a></p>&mdash; 🌈 TOKIMEKI Bluesky (<a href="https://bsky.app/profile/did:plc:4tr5dqti7nmu6g2czpthntak?ref_src=embed">@tokimeki.blue</a>) <a href="https://bsky.app/profile/did:plc:4tr5dqti7nmu6g2czpthntak/post/3l67oc7d2pq27?ref_src=embed">Oct 10, 2024 at 10:50 PM</a></blockquote><script async src="https://embed.bsky.app/static/embed.js" charset="utf-8"></script>

### Current Recommendations

What do we recommend to developers looking to extend record schemas today?

Our current recommendation is to define new Lexicons for "sidecar" records. Instead of adding fields to `app.bsky.actor.profile`, define a new record schema (eg com.yourapp.profile) and put the fields there. When rendering a profile view, fetch this additional record at the same time. Some records always have a fixed record key, like `self`, so they can be fetched with a simple GET. For records like `app.bsky.feed.post`, which have TID record keys, the sidecar records can have the same record key as the original post, so they also can be fetched with a simple GET. We use this pattern at scale in the bsky Lexicons with `app.bsky.feed.threadgate`, which extends the post schema, and allows data updates without changing the version (CID) of the post record itself.

There is some overhead to doing additional fetches, but these can be mitigated with caching or building a shim API server (with updated API Lexicions) to blend in the additional data to "view" requests. If needed, support could be improved with generic APIs to automatically hydrate "related records" with matching TIDs across collections in the same repository.

If sidecar records are not an option, and developers feel they must add data directly to existing record types, we very strongly recommend against field names that might conflict. Even if you think other developers might want to use the same extension, you should intentionally choose long unique prefixes for field names to prevent conflicts both with the "authoritative" Lexicon author, and other developers who might try to make the same extension. What we currently recommend is using a long, unique, non-generic project name prefix, or even a full NSID for the field name. For example, `app.graysky.pinnedPost` or `grayskyPinnedPost` are acceptable, but not `pinnedPost` or `extPinnedPost`.

While there has been some clever and admirable use of extension fields (the [SkyFeed configuration mechanism](https://astrolabe-famz.onrender.com/at/redsolver.dev/app.bsky.feed.generator/aaaf7pgw4xqhu) in `app.bsky.feed.generator` records comes to mind), we don't see inserting fields into data specified by other parties as a reliable or responsible practice in the long run. We acknowledge that there is a demonstrated demand for a simple extension mechanism, and safer ways to insert extension data in records might be specified in the future.

Proposals and discussion welcome! There is an [existing thread on Github](https://github.com/bluesky-social/atproto/discussions/1889).

### Progress with Lexicons

While not directly related to extension fields, we have a bunch of ongoing work with the overall system.

We are designing a mechanism for Lexicon resolution. This will allow anybody on the public internet to authoritatively resolve the schema for a given NSID. This process should not need to happen very often, and we want to incorporate lessons from previous live schema validation systems (including XML), but there does need to be a way to demonstrate authority.

We are planning to build an aggregator and automated documentation system for Lexicons, similar to package management systems like [pkg.go.dev](https://pkg.go.dev) and [lib.rs](https://lib.rs). These will make it easier to discover and work with independent Lexicons across the ATmosphere and provide baseline documentation of schemas for developers. They can also provide collective benefits such as archiving, flagging abuse and security problems, and enabling research.

We are writing a style guide for authoring Lexicons, with design patterns, tips and common gotchas, and considerations for evolution and extensibility.

The validation behaviors for the `unknown` and `union` Lexicon types [have been clarified](https://github.com/bluesky-social/atproto-website/pull/349) in the specifications.

The schema validation behavior when records are created at PDS instances has been updated, and will be reflected in the specifications soon ([a summary is available](https://github.com/bluesky-social/atproto-website/issues/353)).

Generic run-time Lexicon validation support was [added to the Go SDK](https://github.com/bluesky-social/indigo/pull/420) (indigo), and test vectors were [added to the atproto interop tests repository](https://github.com/bluesky-social/atproto-interop-tests/tree/main/lexicon).

Finally, an end-to-end [tutorial on building an example app](https://atproto.com/guides/applications) ("Statusphere") using custom Lexicons was added to the updated atproto documentation website.

Overall, the process for designing and publishing new schemas from scratch should be clearer soon, and the experience of finding and working with existing schemas should be significantly improved as well.
