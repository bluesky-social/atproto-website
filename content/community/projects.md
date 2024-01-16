---
title: Community Projects
summary: Built by third-party community developers.
---

# Community Projects

This is a partial list of community projects. Read instructions for how to submit your project to this page [here](/community/projects#submit-your-project).

### App Passwords

For the security of your account, when using any third-party clients, please generate an [app password](/specs/xrpc#app-passwords) at Settings > Advanced > App passwords.

App passwords have most of the same abilities as the user's account password, but they're restricted from destructive actions such as account deletion or account migration. They are also restricted from creating additional app passwords.

Read our disclaimer [below](/community/projects#disclaimer).

## AT Protocol Implementations

#### TypeScript

- [atproto](https://github.com/bluesky-social/atproto): this is the leading protocol implementation, developed by Bluesky PBC

#### Go

- [indigo](https://github.com/bluesky-social/indigo): developed by Bluesky PBC
- [goat](https://codeberg.org/s877/goat): new, not stable

#### Python

- [atproto](https://github.com/MarshalX/atproto): not stable. XRPC clients, Firehose clients, DID and Handle resolvers, more.
- [lexrpc](https://github.com/snarfed/lexrpc): not stable
- [atprototools](https://github.com/ianklatzco/atprototools): new, not stable
- [Chitose](https://github.com/mnogu/chitose): new, not stable
- [arroba](https://github.com/snarfed/arroba): new, not stable. PDS implementation with MST, commit repo, diff and `com.atproto.sync` XRPC methods
- [picopds](https://github.com/DavidBuchanan314/picopds): new, not stable. A bare-minimum PDS implementation with just enough to federate with the sandbox network.
- [blue-pyinthe-sky](https://github.com/robcerda/blue-pyinthe-sky): new, not stable
- [gokyuzu](https://github.com/kiliczsh/gokyuzu): not stable

#### Dart

- [atproto](https://github.com/myConsciousness/atproto.dart/tree/main/packages/atproto) and [bluesky](https://github.com/myConsciousness/atproto.dart/tree/main/packages/bluesky)

#### C#

- [FishyFlip](https://github.com/drasticactions/FishyFlip): new, not stable

#### Java

- [bsky4j](https://github.com/uakihir0/bsky4j): new, not stable

#### PHP

- [socialweb/atproto-lexicon](https://github.com/socialweb-php/atproto-lexicon): Parses and resolves Lexicon schemas; useful for code generation
- [potibm/phluesky](https://github.com/potibm/phluesky): a small library for posting to Bluesky, new, not stable

#### R

- [atr](https://github.com/JBGruber/atr): auto-generated functions (unstable & unexposed) + user facing functions for selected endpoints (planned to be stable)
- [bskyr](https://christophertkenny.com/bskyr/): An R interface for posting to and collecting tidy data from Bluesky (stable)

#### Ruby

- [bskyrb](https://github.com/ShreyanJain9/bskyrb): new, not stable
- [minisky](https://github.com/mackuba/minisky): minimal client

#### Rust

- [adenosine](https://gitlab.com/bnewbold/adenosine): not stable
- [ATrium](https://github.com/sugyan/atrium): not stable

#### Swift

- [swift-atproto](https://github.com/nnabeyang/swift-atproto): new, not stable

## Tutorials and Guides

- [atproto docs in Japanese](https://github.com/encrypteduse/atproto-website-docs-jp) by [@encrypteduse](https://github.com/encrypteduse)
- [atproto starter kit](https://github.com/aliceisjustplaying/atproto-starter-kit), TypeScript/Node template, by [@alice.bsky.sh](https://bsky.app/profile/did:plc:by3jhwdqgbtrcc7q4tkkv3cf)
- [How to build a Bluesky bot using ATProto and OpenAI API](https://ashevat.medium.com/how-to-build-a-bluesky-bot-using-atproto-and-openai-api-77a26a154b) by [@amir.blue](https://bsky.app/profile/did:plc:ua6usdc4hzvzjsokoenba4zt)
- [Bluesky bot tutorial](https://github.com/emilyliu7321/bluesky-emoji-bot/blob/main/TUTORIAL.md) by [@emily.bsky.team](https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn)
- [Getting started with #atdev](https://graysky.app/blog/2023-10-17-getting-started-atproto) by [@mozzius.dev](https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep)

## Clients

The official Bluesky app is available on the [iOS App](https://apps.apple.com/us/app/bluesky-social/id6444370199) and [Google Play](https://play.google.com/store/apps/details?id=xyz.blueskyweb.app&hl=en_US) stores as well as on [desktop](https://bsky.app/).

### Web

- [Tokimeki](https://tokimekibluesky.vercel.app/) by [@holybea](https://bsky.app/profile/did:plc:hiptcrt4k63szzz4ty3dhwcp)
- [Klearsky](https://klearsky.pages.dev/) by [@mimonelu.net](https://bsky.app/profile/did:plc:ilxxgyz7oz7mysber4omeqrg)
- [Laika](https://laika-bluesky.web.app/) by [@makoto.bsky.social](https://bsky.app/profile/did:plc:tr5cijtwcpl2dqrtmjsmmcow)
- [Skylight](https://penpenpng.github.io/skylight) by [@penpenpng.bsky.social](https://bsky.app/profile/did:plc:ahj2yuo63gaxyhbgn5ai6jt2)
- [The Blue](https://the-blue.shino3.net) by [@shino3.bsky.social](https://bsky.app/profile/did:plc:rpwpuzu2yyiuufm3232d7pm5)
- [Ucho-ten](https://ucho-ten.net) by [@bisn.ucho-ten.net](https://bsky.app/profile/did:plc:txandrhc7afdozk6a2itgltm) and [@hota1024.com](https://bsky.app/profile/did:plc:qhnfzuuv33o7gggw6mmu2ks4)
- [Kite🪁](https://kite.black) by [@arta.bsky.social](https://bsky.app/profile/did:plc:cqednx7rqstpsgdgec4byd6g)
- [Sunrise](https://sunrise.li/auth/login) by [@telmo.is](https://bsky.app/profile/did:plc:gtbohpin5op22ispn4gdnt7n)
- [Blue Wrapper](https://blue.amazingca.dev) by [@caleb.bsky.social](https://bsky.app/profile/did:plc:e2nwnarqo7kdbt7ngr3gejp6)
- [Connectsky - Extension based AT Proto Client](https://chrome.google.com/webstore/detail/connectsky-an-at-proto-cl/dfjlfmdhkgcpendpfflnlaedfgaoiaed/related) by [@anku.bsky.social](https://bsky.app/profile/did:plc:5t2x7mmh4ofspj7apwpgif5l)
- [SkyDeck](https://skydeck.social) by [@mattstypa.bsky.social](https://bsky.app/profile/did:plc:hnbglrwshrdspimiliyoohhu)
- [SkyFeed](https://skyfeed.app) by [@redsolver.net](https://bsky.app/profile/did:plc:odo2zkpujsgcxtz7ph24djkj)
- [Swat.io](https://swat.io/en/) by [@swat.io](https://bsky.app/profile/did:plc:xp4xvmqtpeeav2yo3ua23yfn) 
- [redocean](https://redocean.forza7.org/) ([GitHub](https://github.com/forza7taka/redocean)) by [@forza7.bsky.social](https://bsky.app/profile/did:plc:au6x2h2niz27male2krpwmzz)
- [Langit](https://langit.pages.dev/) ([GitHub](https://github.com/intrnl/langit)) by [@intrnl.bsky.social](https://bsky.app/profile/did:plc:qezk54orevt3dtm4ijcyadnq)
- [vSky](https://vsky.social) ([GitHub](https://github.com/skiniks/vsky)) by [@ryanskinner.com](https://bsky.app/profile/did:plc:ubz4oedvsb7dsuncqi5jb7o2)
- [Skylight Bluesky Style](https://skylight-bluesky-style.vercel.app/#/) ([GitHub](https://github.com/louiscnovel2/skylight-bluesky-style)) by [@louis.bsky.social](https://bsky.app/profile/did:plc:fporki4626psbdnxzeh7lhg5)
- [deck.blue](https://deck.blue) by [@deck.blue](https://bsky.app/profile/did:plc:w342borqxtyo2pul67ec2pwt)
- [Fedica](https://fedica.com/social-media/bluesky) by [@fedicahq.bsky.social](https://bsky.app/profile/did:plc:n7nimjfhrwsrgsuothysn2h6) can cross-post and schedule posts and threads
- [Subium](https://subium.com) by [@oleksanovyk.com](https://bsky.app/profile/did:plc:rq6jsdmsptn4m7tfz7cd7nyv): web client with focus on smooth UI and mobile devices support
- [Skeetdeck](https://skeetdeck.pages.dev) by [@mary.my.id](https://bsky.app/profile/did:plc:ia76kvnndjutgedggx2ibrem)
- [Ouranos 🌸](https://useouranos.app) [(GitHub)](https://github.com/pdelfan/ouranos) by [@contrapunctus.bsky.social](https://bsky.app/profile/did:plc:3sapfnszmvjc6wa4ml3ybkwb)

### iOS

- [Graysky](https://apps.apple.com/gb/app/graysky/id6448234181) ([GitHub](https://github.com/mozzius/graysky)) by [@mozzius.dev](https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep) and [@alice.bsky.sh](https://bsky.app/profile/did:plc:by3jhwdqgbtrcc7q4tkkv3cf)
- [Yup](https://yup.io/), an app to cross-post to Bluesky and other social apps
- [Mofu](https://apps.apple.com/en/app/mofu/id6463493340) by [@andooown.bsky.social](https://bsky.app/profile/did:plc:q52x5zrsukzvh4bv4eidsvcj)
- [Sora](https://mszpro.com/sorasns/), a Fediverse app for Bluesky and other platforms by [@mszpro.com](https://bsky.app/profile/did:plc:fynelmajwyd4arrdpmm2mkqu)
- [Skeets](https://bsky.app/profile/skeetsapp.com), an app that offers bookmarks, drafts, mute words, etc. by [@seabass.bsky.social](https://bsky.app/profile/did:plc:ituoear7k6qx3smjfoxhufm4)

### Android

- [Seiun](https://github.com/akiomik/seiun) by [@omi.bsky.social](https://bsky.app/profile/did:plc:j5cxpczcvzajlxhfuq7abivp)
- [Ozone](https://github.com/christiandeange/ozone) by [@chr.bsky.social](https://bsky.app/profile/did:plc:soed46hcvg3l24tshb352cy6)
- [Graysky](https://play.google.com/store/apps/details?id=dev.mozzius.graysky) ([GitHub](https://github.com/mozzius/graysky)) by [@mozzius.dev](https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep) and [@alice.bsky.sh](https://bsky.app/profile/did:plc:by3jhwdqgbtrcc7q4tkkv3cf)
- [Greenland](https://github.com/itsWindows11/Greenland) by [@simplebear.bsky.social](https://bsky.app/profile/did:plc:li5ejsts35x45ozaqlqmewso)
- [Skywalker](https://play.google.com/store/apps/details?id=com.gmail.mfnboer.skywalker) ([GitHub](https://github.com/mfnboer/skywalker)) by [@michelbestaat.bsky.social](https://bsky.app/profile/did:plc:qxaugrh7755sxvmxndcvcsgn)


### macOS

- [Bluesky for Raycast](https://www.raycast.com/dharamkapila/bluesky): A Bluesky client for [Raycast](https://www.raycast.com) by [@dharam.bsky.social](https://bsky.app/profile/did:plc:qqoncpemipyncukz3esxjcbg)
- [swiftsky](https://github.com/rmcan/swiftsky): A Bluesky client for macOS by [@can.bsky.social](https://bsky.app/profile/did:plc:oaerst6hznvwkeqtar5dtqry)

### CLI

- [gosky](https://github.com/bluesky-social/indigo/tree/main/cmd/gosky) (Golang) developed by Bluesky PBC
- [adenosine-cli](https://gitlab.com/bnewbold/adenosine/-/blob/main/adenosine-cli/README.md) (Rust) developed by [@bnewbold.bsky.team](https://bsky.app/profile/did:plc:44ybard66vv44zksje25o7dz)
- [bsky](https://github.com/mattn/bsky) (Golang) developed by [@mattn.bsky.social](https://bsky.app/profile/did:plc:ituhatvv5pyz4rwsj4hfrslh)
- [atr](https://github.com/syui/atr) (Rust) developed by [@syui.ai](https://bsky.app/profile/did:plc:uqzpqmrjnptsxezjx4xuh2mn)
- [bluesky_cli](https://github.com/myConsciousness/atproto.dart/tree/main/packages/bluesky_cli) (Dart) developed by [@shinyakato.dev](https://bsky.app/profile/did:plc:iijrtk7ocored6zuziwmqq3c)
- [blue-sky-cli](https://github.com/wesbos/blue-sky-cli) (Typescript) developed by [@wesbos](https://bsky.app/profile/did:plc:etdjdgnly5tz5l5xdd4jq76d)

## Bridges

- [SkyBridge](https://github.com/videah/skybridge) to use Mastodon apps with Bluesky by [@videah.net](https://bsky.app/profile/did:plc:inze6wrmsm7pjl7yta3oig77)
- [Bluestream](https://bluestream.deno.dev/), RSS feed generator for Bluesky by [@kawarimidoll.bsky.social](https://bsky.app/profile/did:plc:okalufxun5rpqzdrwf5bpu3d)
- [Twitter-to-Bsky](https://github.com/ianklatzco/twitter-to-bsky), to import your Twitter archive to Bluesky by [@klatz.co](https://bsky.app/profile/did:plc:o2hywbrivbyxugiukoexum57)
- [bluesky-post](https://github.com/myConsciousness/atproto.dart/tree/main/packages/bluesky_post), a tool to post from GitHub Actions to Bluesky, by [@shinyakato.dev](https://bsky.app/profile/did:plc:iijrtk7ocored6zuziwmqq3c)
- [granary](https://granary.io/), converts `app.bsky` objects to/from ActivityStreams, RSS, Atom, HTML, and more, by [@snarfed.org](https://bsky.app/profile/did:plc:fdme4gb7mu7zrie7peay7tst)
- [Sky Follower Bridge](https://github.com/kawamataryo/sky-follower-bridge), instantly find and follow Twitter followers on Bluesky, by [@kawamataryo.bsky.social](https://bsky.app/profile/did:plc:hcp53er6pefwijpdceo5x4bp)
- [bluesky-sms-service](https://github.com/kylefmohr/bluesky-sms-service), allows you to post via SMS, by [@assf.art](https://bsky.app/profile/did:plc:os4uvzzv76z34z6qhgylfnqm)

## Custom Feeds

To build your own custom feed, you can use Bluesky's official feed generator starter kit [here](https://github.com/bluesky-social/feed-generator).
- [Skyfeed](https://skyfeed.app), a dashboard-like experience with a custom feed builder, by [@redsolver.dev](https://bsky.app/profile/did:plc:odo2zkpujsgcxtz7ph24djkj)
- [Goodfeeds](https://goodfeeds.co/), a tool to search custom feeds, by [@jcsalterego.bsky.social](https://bsky.app/profile/did:plc:vc7f4oafdgxsihk4cry2xpze)
- [Skyline](https://skyline.gay/), create your own algorithm feeds, by [@louis02x.com](https://bsky.app/profile/did:plc:g74nxoyriqoo7jyclzlqkbj2)
- [Bossett's Custom Feeds](https://github.com/Bossett/bsky-feeds) ([guide](https://bossett.io/setting-up-bossetts-bluesky-feed-generator/)), fork of official generator for What's Science 🧪 feed & to easily host multiple algorithms with more advanced matching, by [@bossett.bsky.social](https://bsky.app/profile/did:plc:jfhpnnst6flqway4eaeqzj2a)
- [blue_factory](https://github.com/mackuba/blue_factory), a Ruby implementation of a feed generator, by [@mackuba.eu](https://bsky.app/profile/did:plc:oio4hkxaop4ao4wz2pp3f4cr)
- [bluesky-feeds-rb](https://github.com/mackuba/bluesky-feeds-rb), a complete example of a custom feed service in Ruby, by [@mackuba.eu](https://bsky.app/profile/did:plc:oio4hkxaop4ao4wz2pp3f4cr)
- [Bluesky Social Feeds](https://blueskyfeeds.com), a tool to search and build custom feeds without code or regex, by [@blueskyfeeds.com](https://bsky.app/profile/did:plc:eubjsqnf5edgvcc6zuoyixhw)
- [bluesky-feed-generator](https://github.com/MarshalX/bluesky-feed-generator), community feed generator starter kit in Python, by [@marshal.dev](https://bsky.app/profile/did:plc:s6jnht6koorxz7trghirytmf)

## Stats

- [ATScan](https://atscan.net) by [@tree.fail](https://bsky.app/profile/did:plc:524tuhdhh3m7li5gycdn6boe)
- [Bluesky social graph generator](https://bsky.jazco.dev/) by [@jaz.bsky.social](https://bsky.app/profile/did:plc:q6gjnaw2blty4crticxkmujt)
- [Bluesky stats](https://bsky.jazco.dev/stats) by [@jaz.bsky.social](https://bsky.app/profile/did:plc:q6gjnaw2blty4crticxkmujt)
- [Bluesky user growth](https://vqv.app/stats/chart) by [@m3ta.uk](https://bsky.app/profile/did:plc:ui7jfx3hdkfb4qr4ncfbqgvv) and [vqv.app](https://bsky.app/profile/did:plc:md6i2csjmkfoie6u4ot4kjmn)
- [Skyfeed Builder Feed Stats](https://stats.skyfeed.me/)

## Custom domains and handles

You can purchase and manage a custom domain through Bluesky [here](https://account.bsky.app/). Read more about this service [here](https://blueskyweb.xyz/blog/7-05-2023-namecheap).
- [Skyname](https://skyna.me/), register a free unique username for your Bluesky account, by [@darn.fish](https://bsky.app/profile/did:plc:7qw3ldjppmwmtjoak3egctdb)
- [Open Handles](https://github.com/SlickDomique/open-handles), an app to let others create a handle with your domains, by [@domi.zip](https://bsky.app/profile/did:plc:7bwr7mioqql34n2mrqwqypbz)
- [swifties.social](https://swifties.social/), claim a `swifties.social` handle, by [@mozzius.dev](https://bsky.app/profile/did:plc:p2cp5gopk7mgjegy6wadk3ep)

## Firehose

- [Firesky](https://firesky.tv), real-time stream of every Bluesky post, by [@johnspurlock.com](https://bsky.app/profile/did:plc:mceyt3qjswifxtikqqwvnnge)
- [Blue skies ahead](https://blue-skies-ahead.glitch.me/), view a feed of Bluesky posts, by [@gautham.bsky.social](https://bsky.app/profile/did:plc:sqhiuhi54wjzwsglrduhwxm6)
- [atproto-firehose](https://github.com/kcchu/atproto-firehose), NodeJS/Typescript library for accessing AT Protocol Event Stream (aka firehose),  and a CLI for streaming Bluesky Social events, by [@kcchu.xyz](https://bsky.app/profile/did:plc:ocko5cww67whp5lejhh57zdd)
- [blueskyfirehose](https://github.com/CharlesDardaman/blueskyfirehose), view a firehose of all bsky.social posts, by [@charles.dardaman.com](https://bsky.app/profile/did:plc:ibuqevx5au345anhlfeneo2m)
- [Skyfall](https://github.com/mackuba/skyfall), a Ruby gem for streaming events from the firehose, by [@mackuba.eu](https://bsky.app/profile/did:plc:oio4hkxaop4ao4wz2pp3f4cr)
- [firehose.ts](https://github.com/badlogic/skychat/blob/85f93317ee389f34d2c7ddf99ddcaa36e1ee076f/src/firehose.ts), a minimal TypeScript code example how to access the firehose in a browser environment, based on [atproto-firehose](https://github.com/kcchu/atproto-firehose), by [@badlogic.bsky.social](https://bsky.app/profile/did:plc:7syfakzcriq44mwbdbc7jwvn)
- [Python Firehose](https://atproto.blue/en/latest/firehose.html), fast firehose client with decoding in Python, by [@marshal.dev](https://bsky.app/profile/did:plc:s6jnht6koorxz7trghirytmf)



## Other Tools

- Skylink [Chrome](https://skylinkchrome.com) and [Firefox](https://skylinkff.com/) extension to detect DIDs while browsing the web, by [@adhdjesse.com](https://bsky.app/profile/did:plc:f55kfczvcsjlaota4ep2xvhx)
- [Skycle.app](https://skycle.app) - visualize your circle of friends on Bluesky, by [@pirmax.fr](https://bsky.app/profile/pirmax.fr)
- [Skyspaces](https://www.skyspaces.net/) audio rooms by [@geeken.tv](https://bsky.app/profile/did:plc:lbjhpk3a473cuufkenjcer3v)
- [Glamorous Toolkit for AT Protocol](https://github.com/feenkcom/gt4atproto), a moldable development environment
- [Bluesky post heatmap generator](https://bluesky-heatmap.fly.dev/) by [@alice.bsky.sh](https://bsky.app/profile/did:plc:by3jhwdqgbtrcc7q4tkkv3cf)
- [Skyspace](https://bsky.app/profile/did:plc:dxu2v6dt7ppqdnyjf3p53ram), a Myspace clone by [@jem.fm](https://bsky.app/profile/did:plc:7ry4kiemzesxucqv26q73znv)
- [Add Bluesky feed embeds](https://bsky.app/profile/did:plc:ijpidtwscybqhs5fxyzjojmu/post/3juerzwcl4424) by [@felicitas.pojtinger.com](https://bsky.app/profile/did:plc:ijpidtwscybqhs5fxyzjojmu)
- [bsky.link](https://bsky.link/), generate embeddable link previews for Bluesky posts, by [@jamesg.blog](https://bsky.app/profile/did:plc:6wwzaz5n4ordx762esmflyhx)
- [Bluesky Overhaul](https://github.com/xenohunter/bluesky-overhaul), browser extension that improves UX on the web app by [@blisstweeting.ingroup.social](https://bsky.app/profile/did:plc:ihbptowbt4tkcjqespanfbez)
- [atp tooling](https://blue.amazingca.dev/tools), cache and unfollow repos and users, by [@caleb.bsky.social](https://bsky.app/profile/did:plc:e2nwnarqo7kdbt7ngr3gejp6)
- [bluesky-esphome](https://github.com/softplus/bluesky_esphome), basic ESPHOME / ESP32 configuration to display Bluesky data, by [@sugyan.com](https://bsky.app/profile/did:plc:4ee6oesrsbtmuln4gqsqf6fp)
- [Airspace](https://bsky-airspace.onrender.com/) Social Blade for Bluesky showing history of follows/followers/posts count for any user, by [@nirsd.bsky.social](https://bsky.app/profile/did:plc:gzs37etm32zvsznn775hy35w)
- [Skythread](https://blue.mackuba.eu/skythread/), a tool for reading threads in a tree layout, by [@mackuba.eu](https://bsky.app/profile/did:plc:oio4hkxaop4ao4wz2pp3f4cr)
- [SkyPicker](https://skypicker.site/), a tool to do raffles in Bluesky by [@joseli.to](https://bsky.app/profile/did:plc:uorsid6pyxlcoggl3b65mzfy)
- [Skircle](https://skircle.me), visualize Bluesky Interaction Circles by [@skircle.bsky.social](https://bsky.app/profile/did:plc:7neczgqjegyixcjlr4dlnkf5)
- [Neznam Atproto share](https://github.com/ne-znam/neznam-atproto-share), WordPress plugin to automatically share posts from WordPress to timeline, by [@mbanusic.com](https://bsky.app/profile/did:plc:diud5hvgw7ssqvhwm5zamiwe)
- [SkySweeper](https://github.com/pojntfx/skysweeper), service which automatically deletes your old skeets from Bluesky, by [@felicitas.pojtinger.com](https://bsky.app/profile/did:plc:ijpidtwscybqhs5fxyzjojmu)
- [skeetgen](https://mary-ext.github.io/skeetgen), a tool for generating an easily viewable Bluesky archive, by [@mary.my.id](https://bsky.app/profile/did:plc:ia76kvnndjutgedggx2ibrem)
- [sum-up.xyz](https://sum-up.xyz), service which uses ChatGPT to humourously summarize a BlueSky user's last 50 posts, by [@badlogic.bsky.social](https://bsky.app/profile/did:plc:7syfakzcriq44mwbdbc7jwvn)
- [skyview.social](https://skyview.social), a thread reader app to read BlueSky threads in various forms and share them externally without needing an account, by [@badlogic.bsky.social](https://bsky.app/profile/did:plc:7syfakzcriq44mwbdbc7jwvn)
- [Skystats](https://skystats.social), view a user's 30 day BlueSky statistics such as people most interacted with, word cloud, posts per day/time of day/week day, etc., by [@badlogic.bsky.social](https://bsky.app/profile/did:plc:7syfakzcriq44mwbdbc7jwvn)
- [Hugfairy](https://bsky-hugfairy.vercel.app/), a tool to send hugs to other BlueSky users, by [@haider.bsky.social](https://bsky.app/profile/did:plc:sjp7tdeiw5wvgdb4h2xts4sq)

## Bots

- [MTA Alerts](https://bsky.app/profile/did:plc:jvhf36loasspmffobuyfpopz) by [@ryanskinner.com](https://bsky.app/profile/did:plc:ubz4oedvsb7dsuncqi5jb7o2)
- [Limerick bot](https://bsky.app/profile/did:plc:kqz6gh5hiukhcfg7i3hgpzzh) by [@gar.lol](https://bsky.app/profile/did:plc:4r2qco7eb644cpyga5r6vdib)
- [Assorted bots](https://github.com/QuietImCoding/bskybots) that reply on command by [@goose.art](https://bsky.app/profile/did:plc:hsqwcidfez66lwm3gxhfv5in)
- [Earthquake bot](https://bsky.app/profile/did:plc:oga3ylymphrqdxb3nvjgm23y) ([GitHub](https://github.com/emilyliu7321/bsky-earthquake-bot)) by [@emily.bsky.team](https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn)
- [Song of songs bot](https://bsky.app/profile/did:plc:75aqefjj3p45ubompts62agn) by [@alice.bsky.sh](https://bsky.app/profile/did:plc:by3jhwdqgbtrcc7q4tkkv3cf)
- [FAQ bot](https://github.com/dcsan/bsky-faq-bot) by [@dcsan.xyz](https://bsky.app/profile/did:plc:66exg3ue3crrvms3kltkwy4j)
- [GitHub Trending bot](https://bsky.app/profile/did:plc:eidn2o5kwuaqcss7zo7ivye5) ([GitHub](https://github.com/kawamataryo/bsky-github-trending-bot)) by [@kawamataryo.bsky.social](https://bsky.app/profile/did:plc:hcp53er6pefwijpdceo5x4bp)
- [Bsky Weathercam Bot - blueskies.bsky.social !](https://bsky.app/profile/did:plc:n5ddwqolbjpv2czaronz6q3d) by [ianklatzco](https://bsky.app/profile/did:plc:o2hywbrivbyxugiukoexum57)
- [Get Alt Text](https://bsky.app/profile/did:plc:ck5xa2cgd3negu6usqedzjbf) ([GitHub](https://github.com/hs4man21/bluesky-alt-text-ocr)) by [@holden.bsky.social](https://bsky.app/profile/did:plc:tzq3i67wnarn6x2kbjcprnfx)
- [Trend Words](https://bsky.app/profile/did:plc:7ktx3oe2zbompu3cjwthlest), display words posted more than usual, by [@lamrongol.bsky.social](https://bsky.app/profile/did:plc:wwqlk2n45es2ywkwrf4dwsr2)
- [Most Attention-Grabbing Posts](https://bsky.app/profile/did:plc:boopgqnkg2inpleusxo7kj4l), repost posts which receive the most replies, quotes, reposts and likes, by [@lamrongol.bsky.social](https://bsky.app/profile/did:plc:wwqlk2n45es2ywkwrf4dwsr2)
- [Linux Kernel Releases](https://bsky.app/profile/did:plc:35c6qworuvguvwnpjwfq3b5p) by [@adilson.net.br](https://bsky.app/profile/did:plc:kw6k5btwuh4hazzygvhxygx3)
- [ai bot](https://bsky.app/profile/did:plc:4hqjfn7m6n5hno3doamuhgef) that reply on command and chat by [@syui.ai](https://bsky.app/profile/did:plc:uqzpqmrjnptsxezjx4xuh2mn)
- [Score My Wordle](https://bsky.app/profile/did:plc:wems3hfqqjsfenrrd325q6zo) ([GitHub](https://github.com/shaneafsar/wordlescorer/)), provides Wordle stats and scores across Bluesky, Mastodon, and Twitter, by [@shaneafsar.com](https://bsky.app/profile/did:plc:ksl6jmkhz7qli2ywletvvm2z)
- [Rijden de Treinen](https://bsky.app/profile/did:plc:ijgkhvxpubqao7yiwtbzpyrm), posts train disruptions in the Netherlands, by [@djiwie.bsky.social](https://bsky.app/profile/did:plc:kvbm4te3fersn2nrxukajsql)
- [Adopt a Pet](https://bsky.app/profile/did:plc:huey5xufsv67u3fmmtatj2ox), posts an adoptable pet every 10 minutes, by [@ryanskinner.com](https://bsky.app/profile/did:plc:ubz4oedvsb7dsuncqi5jb7o2)
- [AirportStatusBot](https://bsky.app/profile/did:plc:vu37eou7slndxzs3bc3cjkrv) ([GitHub](https://github.com/fishcharlie/AirportStatusBot)), posts delay information about US airports by [@charlie.fish](https://bsky.app/profile/did:plc:4pxxswmxelihfligwqyz3fqu)
- [Skyview Bot](https://bsky.app/profile/skyview.social), replies with links to unrolled BlueSky threads on [skyview.social](https://skyview.social) that can be shared outside of BlueSky, by [@badlogic.bsky.social](https://bsky.app/profile/did:plc:7syfakzcriq44mwbdbc7jwvn)
- [Year Progress Bot](https://bsky.app/profile/did:plc:ia6umkui2w6j44dbytn2rv7g), posts the progress of current year, by [@haider.bsky.social](https://bsky.app/profile/did:plc:sjp7tdeiw5wvgdb4h2xts4sq)

### Disclaimer

This list of third-party developer clients is provided for informational purposes only. These clients are not affiliated with the Bluesky PBC company, unless otherwise indicated, and we do not endorse or guarantee their performance or security. Users should be aware that logging into their accounts through these third-party clients carries inherent risks, including the possibility of account compromise or data loss. It is important to only use third-party clients that are trusted and reputable. We strongly advise users to exercise caution and use these third-party clients at their own risk. Only log in to your account through a third-party client if you trust the developer and are confident in their ability to safeguard your account information.

We are not responsible for any damage, loss, or unauthorized access to your account that may result from using these third-party clients. By using any of these clients, you acknowledge and accept these risks and limitations.

### Submit your project

To submit or remove your project to this list, you may open a pull request [here](https://github.com/bluesky-social/atproto-website). Please follow the existing formatting as a guideline. For example, use your DID in the link to your profile so it's a stable link even if you change your handle.

Alternatively, you can email projects@atproto.com with a link to your project and your handle.
