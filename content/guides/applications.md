---
title: Applications model
summary: How applications work on the @ Protocol.
tldr:
  - Apps sign into the user's PDS to access their account
  - Apps can directly read and write repo records
  - Most interactions occur through higher-level lexicons
---

# Applications model

Applications on the @ Protocol connect to the user's Personal Data Server (PDS) to access their account. Once a session is established, the app can use the [lexicons](./lexicon) implemented by the PDS to drive behaviors.

In this guide, we'll step through a couple of common patterns (with simple code examples) to help you develop an intuition about this. All APIs shown below are generated using Lexicon's code-generator CLI.

## Signing in

Sign-in and authentication is a simple session-oriented process. The [atproto.com lexicon](/lexicons/atproto.com) includes APIs for creating and managing these sessions.

```typescript
// create an API instance with my PDS
const api = AtpApi.service('my-pds.com')

// sign in using my username and password
const res = await api.com.atproto.createSession({}, {
  username: 'alice@foo.com',
  password: 'hunter2'
})

// configure future calls to include the token in the Authorization header
api.setHeader('Authorization', `Bearer ${res.data.jwt}`)
```

## Repo CRUD

Every user has a public data repository. The application can do basic CRUD on records using the API.

```typescript
await api.com.atproto.repoListRecords({
  repo: 'alice.com',
  type: 'app.bsky.post'
})
await api.com.atproto.repoGetRecord({
  repo: 'alice.com',
  type: 'app.bsky.post',
  tid: '1'
})
await api.com.atproto.repoCreateRecord({
  repo: 'alice.com',
  type: 'app.bsky.post'
}, {
  text: 'Second post!',
  createdAt: (new Date()).toISOString()
})
await api.com.atproto.repoPutRecord({
  repo: 'alice.com',
  type: 'app.bsky.post',
  tid: '1'
}, {
  text: 'Hello universe!',
  createdAt: originalPost.data.createdAt
})
await api.com.atproto.repoDeleteRecord({
  repo: 'alice.com',
  type: 'app.bsky.post',
  tid: '1'
})
```

You may notice that the repo above is identified by a domain name `alice.com`. Take a look at the [Identity guide](./identity) to learn more about that.

## Record types

If you're noticing the "type" field and wondering how that works, see the [Intro to Lexicon guide](./lexicon). Here is a short list of types that are currently used by the ATP software:

### <a href="/lexicons/bsky.app#follow">app.bsky.follow</a>

A social follow. Example:

```typescript
{
  $type: 'app.bsky.follow',
  subject: 'at://did:plc:bv6ggog3tya2z3vxsub7hnal/',
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

### <a href="/lexicons/bsky.app#like">app.bsky.like</a>

A like on a piece of content. Example:

```typescript
{
  $type: 'app.bsky.like',
  subject: 'at://did:plc:bv6ggog3tya2z3vxsub7hnal/app.bsky.post/1',
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

### <a href="/lexicons/bsky.app#post">app.bsky.post</a>

A microblog post. Example:

```typescript
{
  $type: 'app.bsky.post',
  text: 'Hello, world!',
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

### <a href="/lexicons/bsky.app#profile">app.bsky.profile</a>

A user profile. Example:

```typescript
{
  $type: 'app.bsky.profile',
  displayName: 'Alice',
  description: 'A cool hacker'
}
```

### <a href="/lexicons/bsky.app#repost">app.bsky.repost</a>

A repost of an existing microblog post (similar to retweets). Example:

```typescript
{
  $type: 'app.bsky.repost',
  subject: 'at://did:plc:bv6ggog3tya2z3vxsub7hnal/app.bsky.post/1',
  createdAt: '2022-10-10T00:39:08.609Z'
}
```

## Social APIs

While there's a lot that can be done by repo CRUD and other low-level [atproto.com APIs](/lexicons/atproto.com), the [bsky.app lexicon](/lexicons/bsky.app) provides more powerful and easy-to-use APIs for social applications.

```typescript
await api.app.bsky.getHomeFeed()
await api.app.bsky.getProfile({user: 'alice.com'})
await api.app.bsky.getAuthorFeed({author: 'alice.com'})
await api.app.bsky.getUserFollowers({user: 'alice.com'})
await api.app.bsky.getUserFollows({user: 'alice.com'})
await api.app.bsky.getPostThread({uri: 'at://alice.com/app.bsky.post/1'})
await api.app.bsky.getLikedBy({uri: 'at://alice.com/app.bsky.post/1'})
await api.app.bsky.getRepostedBy({uri: 'at://alice.com/app.bsky.post/1'})
await api.app.bsky.getNotifications()
await api.app.bsky.getNotificationCount()
await api.app.bsky.postNotificationsSeen()
```
