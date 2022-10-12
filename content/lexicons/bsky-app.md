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
  assertion: InviteAssertion | EmployeeAssertion | TagAssertion | UnknownAssertion;
  subject: string;
  createdAt: string;
}
export interface InviteAssertion {
  type: "invite";
}
export interface EmployeeAssertion {
  type: "employee";
}
export interface TagAssertion {
  type: "tag";
  tag: string;
}
export interface UnknownAssertion {
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
  subject: string;
  createdAt: string;
}
```

---

## app.bsky.mediaEmbed

<mark>Record type</mark> A list of media embedded in a post or document.

```typescript
export interface Record {
  media: MediaEmbed[];
}
export interface MediaEmbed {
  alt?: string;
  thumb?: MediaEmbedBlob;
  original: MediaEmbedBlob;
}
export interface MediaEmbedBlob {
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
export type TextSlice = [number, number];
export type Entity = {
  index: TextSlice;
  type: string;
  value: string;
}[];

export interface Record {
  text: string;
  entities?: Entity;
  reply?: {
    root: string;
    parent?: string;
  };
  createdAt: string;
}
```

---

## app.bsky.profile

<mark>Record type</mark> 

```typescript
export interface Record {
  displayName: string;
  description?: string;
  badges?: BadgeRef[];
}
export interface BadgeRef {
  uri: string;
}
```

---

## app.bsky.repost

<mark>Record type</mark> 

```typescript
export interface Record {
  subject: string;
  createdAt: string;
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
  feed: FeedItem[];
}
export interface FeedItem {
  cursor: string;
  uri: string;
  author: User;
  repostedBy?: User;
  record: {};
  embed?: RecordEmbed | ExternalEmbed | UnknownEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    like?: string;
  };
}
export interface User {
  did: string;
  name: string;
  displayName?: string;
}
export interface RecordEmbed {
  type: "record";
  author: User;
  record: {};
}
export interface ExternalEmbed {
  type: "external";
  uri: string;
  title: string;
  description: string;
  imageUri: string;
}
export interface UnknownEmbed {
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
  feed: FeedItem[];
}
export interface FeedItem {
  cursor: string;
  uri: string;
  author: User;
  repostedBy?: User;
  record: {};
  embed?: RecordEmbed | ExternalEmbed | UnknownEmbed;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    like?: string;
  };
}
export interface User {
  did: string;
  name: string;
  displayName?: string;
}
export interface RecordEmbed {
  type: "record";
  author: User;
  record: {};
}
export interface ExternalEmbed {
  type: "external";
  uri: string;
  title: string;
  description: string;
  imageUri: string;
}
export interface UnknownEmbed {
  type: string;
}
```

---

## app.bsky.getLikedBy

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
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
  notifications: Notification[];
}
export interface Notification {
  uri: string;
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
  thread: Post;
}
export interface Post {
  uri: string;
  author: User;
  record: {};
  embed?: RecordEmbed | ExternalEmbed | UnknownEmbed;
  parent?: Post;
  replyCount: number;
  replies?: Post[];
  likeCount: number;
  repostCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    like?: string;
  };
}
export interface User {
  did: string;
  name: string;
  displayName?: string;
}
export interface RecordEmbed {
  type: "record";
  author: User;
  record: {};
}
export interface ExternalEmbed {
  type: "external";
  uri: string;
  title: string;
  description: string;
  imageUri: string;
}
export interface UnknownEmbed {
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
  badges: Badge[];
  myState?: {
    follow?: string;
  };
}
export interface Badge {
  uri: string;
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