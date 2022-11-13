---
title: app.bsky.feed
summary: Bluesky Lexicon - Feed Schemas
---

# app.bsky.feed Lexicon

Definitions related to content & activity published in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.feed.vote

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

## app.bsky.feed.mediaEmbed

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

## app.bsky.feed.post

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

## app.bsky.feed.repost

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

## app.bsky.feed.getAuthorFeed

<mark>RPC query</mark> A view of a user's feed

Parameters:

- `author` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
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
  upvoteCount: number;
  indexedAt: string;
  myState?: {
    repost?: string;
    upvote?: string;
    downvote?: string;
  };
}
export interface User {
  did: string;
  handle: string;
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

## app.bsky.feed.getVotes

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `cid` Optional string.
- `direction` Optional string ('up' or 'down').
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
    uri: string;
    cid?: string;
    cursor?: string;
    votes: {
        direction: 'up' | 'down';
        indexedAt: string;
        createdAt: string;
        actor: Actor;
    }[];
}
```

---

## app.bsky.feed.getPostThread

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `depth` Optional number.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
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
    repostCount: number;
    upvoteCount: number;
    downvoteCount: number;
    indexedAt: string;
    myState?: {
        repost?: string;
        upvote?: string;
        downvote?: string;
    };
}
export interface User {
  did: string;
  handle: string;
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

## app.bsky.feed.getRepostedBy

<mark>RPC query</mark> 

Parameters:

- `uri` Required string.
- `cid` Optional string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  uri: string;
  cid?: string;
  cursor?: string;
  repostedBy: {
    did: string;
    handle: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

---

## app.bsky.feed.getTimeline

<mark>RPC query</mark> A view of the user's home timeline

Parameters:

- `algorithm` Optional string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  cursor?: string;
  feed: FeedItem[];
}
export interface FeedItem {
    uri: string;
    cid: string;
    author: Actor;
    trendedBy?: Actor;
    repostedBy?: Actor;
    record: {};
    embed?: RecordEmbed | ExternalEmbed | UnknownEmbed;
    replyCount: number;
    repostCount: number;
    upvoteCount: number;
    downvoteCount: number;
    indexedAt: string;
    myState?: {
        repost?: string;
        upvote?: string;
        downvote?: string;
    };
}
export interface User {
  did: string;
  handle: string;
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

<!-- END lex generated TOC please keep comment here to allow auto update -->
