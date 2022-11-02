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

## app.bsky.badgeAccept

<mark>Record type</mark> 

```typescript
export interface Record {
  badge: Subject;
  offer: Subject;
  createdAt: string;
}
export interface Subject {
  uri: string;
  cid: string;
}
```

---

## app.bsky.badgeOffer

<mark>Record type</mark> 

```typescript
export interface Record {
  badge: Badge;
  subject: string;
  createdAt: string;
}
export interface Badge {
  uri: string;
  cid: string;
}
```

---

## app.bsky.declaration

<mark>Record type</mark> Context for an account that is considered intrinsic to it and alters the fundamental understanding of an account of changed. A declaration should be treated as immutable.

```typescript
export type ActorKnown = "app.bsky.actorUser" | "app.bsky.actorScene";
export type ActorUnknown = string;

export interface Record {
  actorType: ActorKnown | ActorUnknown;
}
```

---

## app.bsky.follow

<mark>Record type</mark> A social follow

```typescript
export interface Record {
  subject: {
    did: string;
    declarationCid: string;
  };
  createdAt: string;
}
```

---

## app.bsky.invite

<mark>Record type</mark> 

```typescript
export interface Record {
  group: string;
  subject: {
    did: string;
    declarationCid: string;
  };
  createdAt: string;
}
```

---

## app.bsky.inviteAccept

<mark>Record type</mark> 

```typescript
export interface Record {
  group: {
    did: string;
    declarationCid: string;
  };
  invite: {
    uri: string;
    cid: string;
  };
  createdAt: string;
}
```

---

## app.bsky.like

<mark>Record type</mark> 

```typescript
export interface Record {
  subject: Subject;
  createdAt: string;
}
export interface Subject {
  uri: string;
  cid: string;
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

export interface Record {
  text: string;
  entities?: Entity[];
  reply?: {
    root: PostRef;
    parent: PostRef;
  };
  createdAt: string;
}
export interface Entity {
  index: TextSlice;
  type: string;
  value: string;
}
export interface PostRef {
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
  pinnedBadges?: BadgeRef[];
}
export interface BadgeRef {
  uri: string;
  cid: string;
}
```

---

## app.bsky.repost

<mark>Record type</mark> 

```typescript
export interface Record {
  subject: Subject;
  createdAt: string;
}
export interface Subject {
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
  cursor?: string;
  feed: FeedItem[];
}
export interface FeedItem {
  uri: string;
  cid: string;
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

## app.bsky.getBadgeMembers

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
  cursor?: string;
  members: {
    did: string;
    name: string;
    displayName?: string;
    offeredAt: string;
    acceptedAt: string;
  }[];
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
  cursor?: string;
  feed: FeedItem[];
}
export interface FeedItem {
  uri: string;
  cid: string;
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
  cursor?: string;
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
  cursor?: string;
  notifications: Notification[];
}
export interface Notification {
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
  thread: Post;
}
export interface Post {
  uri: string;
  cid: string;
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
  pinnedBadges: Badge[];
  myState?: {
    follow?: string;
  };
}
export interface Badge {
  uri: string;
  cid: string;
  error?: string;
  issuer?: {
    did: string;
    name: string;
    displayName?: string;
  };
  assertion?: {
    type: string;
    tag?: string;
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
  cid?: string;
  cursor?: string;
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
  cursor?: string;
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
  cursor?: string;
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

## app.bsky.getUsersSearch

<mark>RPC query</mark> Find users matching search criteria

Parameters:

- `term` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  cursor?: string;
  users: {
    did: string;
    name: string;
    displayName?: string;
    description?: string;
    indexedAt?: string;
  }[];
}
```

---

## app.bsky.getUsersTypeahead

<mark>RPC query</mark> Find user suggestions for a search term

Parameters:

- `term` Required string.
- `limit` Optional number. Max value 100.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  users: {
    did: string;
    name: string;
    displayName?: string;
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

---

## app.bsky.updateProfile

<mark>RPC procedure</mark> Notify server that the user has seen notifications


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  displayName?: string;
  description?: string;
  pinnedBadges?: BadgeRef[];
}
export interface BadgeRef {
  uri: string;
  cid: string;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
  cid: string;
  record: {};
}
```

---

## app.bsky.actorScene

<mark>Token</mark> Actor type: Scene. Defined for app.bsky.declaration's actorType.

---

## app.bsky.actorUser

<mark>Token</mark> Actor type: User. Defined for app.bsky.declaration's actorType.

<!-- END lex generated TOC please keep comment here to allow auto update -->