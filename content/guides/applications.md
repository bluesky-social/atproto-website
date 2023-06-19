---
title: Applications model
summary: How applications work on the AT Protocol.
tldr:
  - Apps sign into the user's PDS to access their account
  - Apps can directly read and write repo records
  - Most interactions occur through higher-level lexicons
---

# Applications model

Applications on the AT Protocol connect to the user's Personal Data Server (PDS) to access their account. Once a session is established, the app can use the [lexicons](./lexicon) implemented by the PDS to drive behaviors.

In this guide, we'll step through a couple of common patterns (with simple code examples) to help you develop an intuition about this. All APIs shown below are generated using Lexicon's code-generator CLI.

## Signing in

Sign-in and authentication is a simple session-oriented process. The [com.atproto.server lexicon](/lexicons/com-atproto-server) includes APIs for creating and managing these sessions.

```typescript
// create an API instance with my PDS
const api = AtpApi.service('my-pds.com')

// sign in using my identifier and password
const res = await api.com.atproto.server.createSession({
  identifier: 'alice.host.com',
  password: 'hunter2'
})

// configure future calls to include the token in the Authorization header
api.setHeader('Authorization', `Bearer ${res.data.accessJwt}`)
```

## Repo CRUD

Every user has a public data repository. The application can do basic CRUD on records using the API.

```typescript
await api.com.atproto.repo.listRecords({
  repo: 'alice.com',
  collection: 'app.bsky.post'
})
await api.com.atproto.repo.getRecord({
  repo: 'alice.com',
  collection: 'app.bsky.post',
  rkey: '3jyfrk3olgd2h'
})
await api.com.atproto.repo.createRecord({
  repo: 'alice.com',
  collection: 'app.bsky.post'
}, {
  text: 'Second post!',
  createdAt: (new Date()).toISOString()
})
await api.com.atproto.repo.putRecord({
  repo: 'alice.com',
  collection: 'app.bsky.post',
  rkey: '3jyfrk3olgd2h'
}, {
  text: 'Hello universe!',
  createdAt: originalPost.data.createdAt
})
await api.com.atproto.repo.deleteRecord({
  repo: 'alice.com',
  collection: 'app.bsky.post',
  rkey: '3jyfrk3olgd2h'
})
```

You may notice that the repo above is identified by a domain name `alice.com`. Take a look at the [Identity guide](./identity) to learn more about that.

## Record types

If you're noticing the "type" field and wondering how that works, see the [Intro to Lexicon guide](./lexicon). Here is a short list of types that are currently used by the ATP software.

You'll notice "cids" in some of the schemas. A "cid" is a "Content ID," a sha256 hash of some referenced content. These are used to ensure integrity; for instance, a like includes the cid of the post being liked so that a future edit can be detected and noted in the UI.

### <a href="/lexicons/app-bsky-graph#follow">app.bsky.graph.follow</a>

A social follow. Example:

```typescript
{
  $type: 'app.bsky.graph.follow',
  subject: 'did:plc:bv6ggog3tya2z3vxsub7hnal',
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

### <a href="/lexicons/app-bsky-feed#like">app.bsky.feed.like</a>

A like on a piece of content. Example:

```typescript
{
  $type: 'app.bsky.feed.like',
  subject: {
    uri: 'at://did:plc:bv6ggog3tya2z3vxsub7hnal/app.bsky.post/1',
    cid: 'bafyreif5lqnk3tgbhi5vgqd6wy5dtovfgndhwta6bwla4iqaohuf2yd764'
  }
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

### <a href="/lexicons/app-bsky-feed#post">app.bsky.feed.post</a>

A microblog post. Example:

```typescript
{
  $type: 'app.bsky.feed.post',
  text: 'Hello, world!',
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

### <a href="/lexicons/app-bsky-actor#profile">app.bsky.actor.profile</a>

A user profile. Example:

```typescript
{
  $type: 'app.bsky.actor.profile',
  displayName: 'Alice',
  description: 'A cool hacker'
}
```

### <a href="/lexicons/app-bsky-feed#repost">app.bsky.feed.repost</a>

A repost of an existing microblog post (similar to retweets). Example:

```typescript
{
  $type: 'app.bsky.feed.repost',
  subject: {
    uri: 'at://did:plc:bv6ggog3tya2z3vxsub7hnal/app.bsky.post/3jyfrk3olgd2h',
    cid: 'bafyreif5lqnk3tgbhi5vgqd6wy5dtovfgndhwta6bwla4iqaohuf2yd764'
  }
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

## Social APIs

While there's a lot that can be done by repo CRUD and other low-level `com.atproto.*` APIs, the `app.bsky.*` lexicon provides more powerful and easy-to-use APIs for social applications.

```typescript
await api.app.bsky.feed.getTimeline()
await api.app.bsky.feed.getAuthorFeed({author: 'alice.com'})
await api.app.bsky.feed.getPostThread({uri: 'at://alice.com/app.bsky.post/3jyfrk3olgd2h'})
await api.app.bsky.feed.getLikes({uri: 'at://alice.com/app.bsky.post/3jyfrk3olgd2h'})
await api.app.bsky.feed.getRepostedBy({uri: 'at://alice.com/app.bsky.post/3jyfrk3olgd2h'})
await api.app.bsky.actor.getProfile({actor: 'alice.com'})
await api.app.bsky.graph.getFollowers({actor: 'alice.com'})
await api.app.bsky.graph.getFollows({actor: 'alice.com'})
await api.app.bsky.notification.listNotifications()
await api.app.bsky.notification.getUnreadCount()
await api.app.bsky.notification.updateSeen()
```
