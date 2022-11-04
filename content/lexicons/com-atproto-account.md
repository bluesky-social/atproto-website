---
title: com.atproto.account
summary: ATP Lexicon - Account Schemas
---

# com.atproto.account Lexicon

Definitions related to account-management in ATP services.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.account.create

<mark>RPC procedure</mark> Create an account.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  email: string;
  handle: string;
  inviteCode?: string;
  password: string;
  recoveryKey?: string;
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
  declarationCid: string;
}
```

---

## com.atproto.account.createInviteCode

<mark>RPC procedure</mark> Create an invite code.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  useCount: number;
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  code: string;
}
```

---

## com.atproto.account.delete

<mark>RPC procedure</mark> Delete an account.


Parameters:

- Schema:

```typescript
export interface Parameters {
  [k: string]: unknown;
}
```

Response:

- Schema:

```typescript
export interface Response {
  [k: string]: unknown;
}
```

---

## com.atproto.account.get

<mark>RPC query</mark> Get information about an account.


Response:

- Schema:

```typescript
export interface Response {
  [k: string]: unknown;
}
```

---

## com.atproto.account.requestPasswordReset

<mark>RPC procedure</mark> Initiate a user account password reset via email


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  email: string;
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {}
```

---

## com.atproto.account.resetPassword

<mark>RPC procedure</mark> Reset a user account password using a token


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  token: string;
  password: string;
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->