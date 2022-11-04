---
title: app.bsky.graph
summary: Bluesky Lexicon - Graph Schemas
---

# app.bsky.graph Lexicon

Definitions related to the social graph in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.graph.follow

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

## app.bsky.graph.invite

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

## app.bsky.graph.inviteAccept

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

## app.bsky.graph.getFollowers

<mark>RPC query</mark> Who is following a user?

Parameters:

- `user` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  subject: {
    did: string;
    handle: string;
    displayName?: string;
  };
  cursor?: string;
  followers: {
    did: string;
    handle: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

---

## app.bsky.graph.getFollows

<mark>RPC query</mark> Who is a user following?

Parameters:

- `user` Required string.
- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  subject: {
    did: string;
    handle: string;
    displayName?: string;
  };
  cursor?: string;
  follows: {
    did: string;
    handle: string;
    displayName?: string;
    createdAt?: string;
    indexedAt: string;
  }[];
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->