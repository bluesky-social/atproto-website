---
title: atproto.com
summary: Schemas used in ATP.
---

# atproto.com Lexicon

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.createAccount

<mark>RPC procedure</mark> Create an account.


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  email: string;
  username: string;
  inviteCode?: string;
  password: string;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  jwt: string;
  username: string;
  did: string;
}
```

---

## com.atproto.createInviteCode

<mark>RPC procedure</mark> Create an invite code.


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  useCount: number;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  code: string;
}
```

---

## com.atproto.createSession

<mark>RPC procedure</mark> Create an authentication session.


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  username: string;
  password: string;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  jwt: string;
  name: string;
  did: string;
}
```

---

## com.atproto.deleteAccount

<mark>RPC procedure</mark> Delete an account.


Input:

- Schema:

```typescript
export interface InputBody {
  [k: string]: unknown;
}
```

Output:

- Schema:

```typescript
export interface OutputBody {
  [k: string]: unknown;
}
```

---

## com.atproto.deleteSession

<mark>RPC procedure</mark> Delete the current session.


Input:

- Schema:

```typescript
export interface InputBody {
  [k: string]: unknown;
}
```

Output:

- Schema:

```typescript
export interface OutputBody {
  [k: string]: unknown;
}
```

---

## com.atproto.getAccount

<mark>RPC query</mark> Get information about an account.


Input:

- Schema:

```typescript
export interface InputBody {
  [k: string]: unknown;
}
```

Output:

- Schema:

```typescript
export interface OutputBody {
  [k: string]: unknown;
}
```

---

## com.atproto.getAccountsConfig

<mark>RPC query</mark> Get a document describing the service's accounts configuration.


Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  inviteCodeRequired?: boolean;
  availableUserDomains: string[];
}
```

---

## com.atproto.getSession

<mark>RPC query</mark> Get information about the current session.


Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  name: string;
  did: string;
}
```

---

## com.atproto.repoBatchWrite

<mark>RPC procedure</mark> Apply a batch transaction of creates, puts, and deletes.

Parameters:

- `did` Required string. The DID of the repo.
- `validate` Optional boolean. Validate the records? Defaults to true.

Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  writes: (
    | {
        action: "create";
        collection: string;
        value: unknown;
      }
    | {
        action: "update";
        collection: string;
        tid: string;
        value: unknown;
      }
    | {
        action: "delete";
        collection: string;
        tid: string;
      }
  )[];
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

## com.atproto.repoCreateRecord

<mark>RPC procedure</mark> Create a new record.

Parameters:

- `did` Required string. The DID of the repo.
- `type` Required string. The NSID of the record type.
- `validate` Optional boolean. Validate the record? Defaults to true.

Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  [k: string]: unknown;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
}
```

---

## com.atproto.repoDeleteRecord

<mark>RPC procedure</mark> Delete a record.

Parameters:

- `did` Required string. The DID of the repo.
- `type` Required string. The NSID of the record type.
- `tid` Required string. The TID of the record.

---

## com.atproto.repoDescribe

<mark>RPC query</mark> Get information about the repo, including the list of collections.

Parameters:

- `nameOrDid` Required string. The username or DID of the repo.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  name: string;
  did: string;
  didDoc: {};
  collections: string[];
  nameIsCorrect: boolean;
}
```

---

## com.atproto.repoGetRecord

<mark>RPC query</mark> Fetch a record.

Parameters:

- `nameOrDid` Required string. The name or DID of the repo.
- `type` Required string. The NSID of the record type.
- `tid` Required string. The TID of the record.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
  value: {};
}
```

---

## com.atproto.repoListRecords

<mark>RPC query</mark> List a range of records in a collection.

Parameters:

- `nameOrDid` Required string. The username or DID of the repo.
- `type` Required string. The NSID of the record type.
- `limit` Optional number. The number of records to return. TODO-max number? Min value 1. Defaults to 50.
- `before` Optional string. A TID to filter the range of records returned.
- `after` Optional string. A TID to filter the range of records returned.
- `reverse` Optional boolean. Reverse the order of the returned records? Defaults to false.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  records: {
    uri: string;
    value: {};
  }[];
}
```

---

## com.atproto.repoPutRecord

<mark>RPC procedure</mark> Write a record.

Parameters:

- `did` Required string. The DID of the repo.
- `type` Required string. The NSID of the record type.
- `tid` Required string. The TID of the record.
- `validate` Optional boolean. Validate the record? Defaults to true.

Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  [k: string]: unknown;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  uri: string;
}
```

---

## com.atproto.requestAccountPasswordReset

<mark>RPC procedure</mark> Initiate a user account password reset via email


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  email: string;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {}
```

---

## com.atproto.resetAccountPassword

<mark>RPC procedure</mark> Reset a user account password using a token


Input:

- Encoding: application/json
- Schema:

```typescript
export interface InputBody {
  token: string;
  password: string;
}
```

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {}
```

---

## com.atproto.resolveName

<mark>RPC query</mark> Provides the DID of a repo.

Parameters:

- `name` Optional string. The name to resolve. If not supplied, will resolve the host's own name.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  did: string;
}
```

---

## com.atproto.syncGetRepo

<mark>RPC query</mark> Gets the repo state.

Parameters:

- `did` Required string. The DID of the repo.
- `from` Optional string. A past commit CID

Output:

- Encoding: application/cbor

---

## com.atproto.syncGetRoot

<mark>RPC query</mark> Gets the current root CID of a repo.

Parameters:

- `did` Required string. The DID of the repo.

Output:

- Encoding: application/json
- Schema:

```typescript
export interface OutputBody {
  root: string;
}
```

---

## com.atproto.syncUpdateRepo

<mark>RPC procedure</mark> Writes commits to a repo.

Parameters:

- `did` Required string. The DID of the repo.

Input:

- Encoding: application/cbor

<!-- END lex generated TOC please keep comment here to allow auto update -->