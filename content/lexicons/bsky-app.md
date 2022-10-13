---
title: bsky.app
summary: Schemas used in the Bluesky social application.
---

# BSky.app Lexicon

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.badge

<mark>Record type</mark> An assertion about the subject by this user.

```typescript
export interface Record {
  assertion:
    | AppBskyBadgeInviteAssertion
    | AppBskyBadgeEmployeeAssertion
    | AppBskyBadgeTagAssertion
    | AppBskyBadgeUnknownAssertion;
  subject: string;
  createdAt: string;
}
export interface AppBskyBadgeInviteAssertion {
  type: "invite";
}
export interface AppBskyBadgeEmployeeAssertion {
  type: "employee";
}
export interface AppBskyBadgeTagAssertion {
  type: "tag";
  tag: string;
}
export interface AppBskyBadgeUnknownAssertion {
  type: string;
}
```

---

## app.bsky.follow

<mark>Record type</mark> A social follow

```typescript
export interface Record {
  subject: string;
  createdAt: string;
}
```

---

## app.bsky.like

<mark>Record type</mark> 

```typescript
export interface Record {
  subject: AppBskyLikeSubject;
  createdAt: string;
}
export interface AppBskyLikeSubject {
  uri: string;
  cid: string;
}
```

---

## app.bsky.mediaEmbed

<mark>Record type</mark> A list of media embedded in a post or document.

```typescript
export interface Record {
  media: AppBskyMediaEmbedMediaEmbed[];
}
export interface AppBskyMediaEmbedMediaEmbed {
  alt?: string;
  thumb?: AppBskyMediaEmbedMediaEmbedBlob;
  original: AppBskyMediaEmbedMediaEmbedBlob;
}
export interface AppBskyMediaEmbedMediaEmbedBlob {
  mimeType: string;
  blobId: string;
}
```

---

## app.bsky.post

<mark>Record type</mark> 

```typescript
/**
 * @minItems 2
 * @maxItems 2
 */
export type AppBskyPostTextSlice = [number, number];
export type AppBskyPostEntity = {
  index: AppBskyPostTextSlice;
  type: string;
  value: string;
}[];

export interface Record {
  text: string;
  entities?: AppBskyPostEntity;
  reply?: {
    root: AppBskyPostPostRef;
    parent: AppBskyPostPostRef;
  };
  createdAt: string;
}
export interface AppBskyPostPostRef {
  uri: string;
  cid: string;
}
```

---

## app.bsky.profile

<mark>Record type</mark> 

```typescript
export interface Record {
  displayName: string;
  description?: string;
  badges?: AppBskyProfileBadgeRef[];
}
export interface AppBskyProfileBadgeRef {
  uri: string;
  cid: string;
}
```

---

## app.bsky.repost

<mark>Record type</mark> 

```typescript
export interface Record {
  subject: AppBskyRepostSubject;
  createdAt: string;
}
export interface AppBskyRepostSubject {
  uri: string;
  cid: string;
}
```

---

## app.bsky.getAuthorFeed

<mark>RPC query</mark> A view of a user's feed

Parameters:

- `author` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  feed: AppBskyGetAuthorFeedFeedItem[];
}
export interface AppBskyGetAuthorFeedFeedItem {
  cursor: string;
  uri: string;
  cid: string;
  author: AppBskyGetAuthorFeedUser;
  repostedBy?: AppBskyGetAuthorFeedUser;
  record: {};
  embed?: AppBskyGetAuthorFeedRecordEmbed | AppBskyGetAuthorFeedExternalEmbed | AppBskyGetAuthorFeedUnknownEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    like?: string;
  };
}
export interface AppBskyGetAuthorFeedUser {
  did: string;
  name: string;
  displayName?: string;
}
export interface AppBskyGetAuthorFeedRecordEmbed {
  type: "record";
  author: AppBskyGetAuthorFeedUser;
  record: {};
}
export interface AppBskyGetAuthorFeedExternalEmbed {
  type: "external";
  uri: string;
  title: string;
  description: string;
  imageUri: string;
}
export interface AppBskyGetAuthorFeedUnknownEmbed {
  type: string;
}
```

---

## app.bsky.getHomeFeed

<mark>RPC query</mark> A view of the user's home feed

Parameters:

- `algorithm` Optional string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  feed: AppBskyGetHomeFeedFeedItem[];
}
export interface AppBskyGetHomeFeedFeedItem {
  cursor: string;
  uri: string;
  cid: string;
  author: AppBskyGetHomeFeedUser;
  repostedBy?: AppBskyGetHomeFeedUser;
  record: {};
  embed?: AppBskyGetHomeFeedRecordEmbed | AppBskyGetHomeFeedExternalEmbed | AppBskyGetHomeFeedUnknownEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    like?: string;
  };
}
export interface AppBskyGetHomeFeedUser {
  did: string;
  name: string;
  displayName?: string;
}
export interface AppBskyGetHomeFeedRecordEmbed {
  type: "record";
  author: AppBskyGetHomeFeedUser;
  record: {};
}
export interface AppBskyGetHomeFeedExternalEmbed {
  type: "external";
  uri: string;
  title: string;
  description: string;
  imageUri: string;
}
export interface AppBskyGetHomeFeedUnknownEmbed {
  type: string;
}
```

---

## app.bsky.getLikedBy

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `cid` Optional string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
  cid?: string;
  likedBy: {
    did: string;
    name: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

---

## app.bsky.getNotificationCount

<mark>RPC query</mark> 


Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  count: number;
}
```

---

## app.bsky.getNotifications

<mark>RPC query</mark> 

Parameters:

- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  notifications: AppBskyGetNotificationsNotification[];
}
export interface AppBskyGetNotificationsNotification {
  uri: string;
  cid: string;
  author: {
    did: string;
    name: string;
    displayName?: string;
  };
  reason: string;
  reasonSubject?: string;
  record: {};
  isRead: boolean;
  indexedAt: string;
}
```

---

## app.bsky.getPostThread

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `depth` Optional number.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  thread: AppBskyGetPostThreadPost;
}
export interface AppBskyGetPostThreadPost {
  uri: string;
  cid: string;
  author: AppBskyGetPostThreadUser;
  record: {};
  embed?: AppBskyGetPostThreadRecordEmbed | AppBskyGetPostThreadExternalEmbed | AppBskyGetPostThreadUnknownEmbed;
  parent?: AppBskyGetPostThreadPost;
  replyCount: number;
  replies?: AppBskyGetPostThreadPost[];
  likeCount: number;
  repostCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    like?: string;
  };
}
export interface AppBskyGetPostThreadUser {
  did: string;
  name: string;
  displayName?: string;
}
export interface AppBskyGetPostThreadRecordEmbed {
  type: "record";
  author: AppBskyGetPostThreadUser;
  record: {};
}
export interface AppBskyGetPostThreadExternalEmbed {
  type: "external";
  uri: string;
  title: string;
  description: string;
  imageUri: string;
}
export interface AppBskyGetPostThreadUnknownEmbed {
  type: string;
}
```

---

## app.bsky.getProfile

<mark>RPC query</mark> 

Parameters:

- `user` Required string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  did: string;
  name: string;
  displayName?: string;
  description?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  badges: AppBskyGetProfileBadge[];
  myState?: {
    follow?: string;
  };
}
export interface AppBskyGetProfileBadge {
  uri: string;
  cid: string;
  error?: string;
  issuer?: {
    did: string;
    name: string;
    displayName: string;
  };
  assertion?: {
    type: string;
  };
  createdAt?: string;
}
```

---

## app.bsky.getRepostedBy

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `cid` Optional string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
  repostedBy: {
    did: string;
    name: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

---

## app.bsky.getUserFollowers

<mark>RPC query</mark> Who is following a user?

Parameters:

- `user` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  subject: {
    did: string;
    name: string;
    displayName?: string;
  };
  followers: {
    did: string;
    name: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

---

## app.bsky.getUserFollows

<mark>RPC query</mark> Who is a user following?

Parameters:

- `user` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  subject: {
    did: string;
    name: string;
    displayName?: string;
  };
  follows: {
    did: string;
    name: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

---

## app.bsky.postNotificationsSeen

<mark>RPC procedure</mark> Notify server that the user has seen notifications


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  seenAt: string;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  [k: string]: unknown;
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->