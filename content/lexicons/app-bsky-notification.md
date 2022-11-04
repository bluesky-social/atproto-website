---
title: app.bsky.notification
summary: Bluesky Lexicon - Notification Schemas
---

# app.bsky.notification Lexicon

Definitions related to notifications.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.notification.getCount

<mark>RPC query</mark> 


Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  count: number;
}
```

---

## app.bsky.notification.list

<mark>RPC query</mark> 

Parameters:

- `limit` Optional number. Max value 100.
- `before` Optional string.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  cursor?: string;
  notifications: Notification[];
}
export interface Notification {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
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

## app.bsky.notification.updateSeen

<mark>RPC procedure</mark> Notify server that the user has seen notifications


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  seenAt: string;
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  [k: string]: unknown;
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->