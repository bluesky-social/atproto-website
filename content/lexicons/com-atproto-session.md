---
title: com.atproto.session
summary: ATP Lexicon - Session Schemas
---

# com.atproto.session Lexicon

Definitions related to session-management in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.session.create

<mark>RPC procedure</mark> Create an authentication session.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  handle: string;
  password: string;
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
}
```

---

## com.atproto.session.delete

<mark>RPC procedure</mark> Delete the current session.


Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  [k: string]: unknown;
}
```

---

## com.atproto.session.get

<mark>RPC query</mark> Get information about the current session.


Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  handle: string;
  did: string;
}
```

---

## com.atproto.session.refresh

<mark>RPC procedure</mark> Refresh an authentication session.


Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->