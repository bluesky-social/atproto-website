---
title: app.bsky.actor
summary: Bluesky Lexicon - Actor Schemas
---

# app.bsky.actor Lexicon

Definitions related to "actors," a general term for users in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.actor.profile

<mark>Record type</mark> 

```typescript
export interface Record {
  displayName: string;
  description?: string;
}
```

---

## app.bsky.actor.getProfile

<mark>RPC query</mark> 

Parameters:

- `user` Required string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  myState?: {
    follow?: string;
  };
}
```

---

## app.bsky.actor.search

<mark>RPC query</mark> Find users matching search criteria

Parameters:

- `term` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  cursor?: string;
  users: {
    did: string;
    handle: string;
    displayName?: string;
    description?: string;
    indexedAt?: string;
  }[];
}
```

---

## app.bsky.actor.searchTypeahead

<mark>RPC query</mark> Find user suggestions for a search term

Parameters:

- `term` Required string.
- `limit` Optional number. Max value 100.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  users: {
    did: string;
    handle: string;
    displayName?: string;
  }[];
}
```

---

## app.bsky.actor.updateProfile

<mark>RPC procedure</mark> Notify server that the user has seen notifications


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  displayName?: string;
  description?: string;
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  uri: string;
  cid: string;
  record: {};
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->