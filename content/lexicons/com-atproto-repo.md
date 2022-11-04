---
title: com.atproto.repo
summary: ATP Lexicon - Repo Schemas
---

# com.atproto.repo Lexicon

Definitions related to repositories in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.repo.batchWrite

<mark>RPC procedure</mark> Apply a batch transaction of creates, puts, and deletes.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  /**
   * The DID of the repo.
   */
  did: string;
  /**
   * Validate the records?
   */
  validate?: boolean;
  writes: (
    | {
        action: "create";
        collection: string;
        rkey?: string;
        value: unknown;
      }
    | {
        action: "update";
        collection: string;
        rkey: string;
        value: unknown;
      }
    | {
        action: "delete";
        collection: string;
        rkey: string;
      }
  )[];
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

---

## com.atproto.repo.createRecord

<mark>RPC procedure</mark> Create a new record.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  /**
   * The DID of the repo.
   */
  did: string;
  /**
   * The NSID of the record collection.
   */
  collection: string;
  /**
   * Validate the record?
   */
  validate?: boolean;
  /**
   * The record to create
   */
  record: {};
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  uri: string;
  cid: string;
}
```

---

## com.atproto.repo.deleteRecord

<mark>RPC procedure</mark> Delete a record.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  /**
   * The DID of the repo.
   */
  did: string;
  /**
   * The NSID of the record collection.
   */
  collection: string;
  /**
   * The key of the record.
   */
  rkey: string;
}
```

---

## com.atproto.repo.describe

<mark>RPC query</mark> Get information about the repo, including the list of collections.

Parameters:

- `user` Required string. The handle or DID of the repo.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  handle: string;
  did: string;
  didDoc: {};
  collections: string[];
  handleIsCorrect: boolean;
}
```

---

## com.atproto.repo.getRecord

<mark>RPC query</mark> Fetch a record.

Parameters:

- `user` Required string. The handle or DID of the repo.
- `collection` Required string. The NSID of the collection.
- `rkey` Required string. The key of the record.
- `cid` Optional string. The CID of the version of the record. If not specified, then return the most recent version.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  uri: string;
  cid?: string;
  value: {};
}
```

---

## com.atproto.repo.listRecords

<mark>RPC query</mark> List a range of records in a collection.

Parameters:

- `user` Required string. The handle or DID of the repo.
- `collection` Required string. The NSID of the record type.
- `limit` Optional number. The number of records to return. TODO-max number? Min value 1. Defaults to 50.
- `before` Optional string. A TID to filter the range of records returned.
- `after` Optional string. A TID to filter the range of records returned.
- `reverse` Optional boolean. Reverse the order of the returned records? Defaults to false.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  cursor?: string;
  records: {
    uri: string;
    cid: string;
    value: {};
  }[];
}
```

---

## com.atproto.repo.putRecord

<mark>RPC procedure</mark> Write a record.


Parameters:

- Encoding: application/json
- Schema:

```typescript
export interface Parameters {
  /**
   * The DID of the repo.
   */
  did: string;
  /**
   * The NSID of the record type.
   */
  collection: string;
  /**
   * The TID of the record.
   */
  rkey: string;
  /**
   * Validate the record?
   */
  validate?: boolean;
  /**
   * The record to create
   */
  record: {};
}
```

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  uri: string;
  cid: string;
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->