---
title: com.atproto.sync
summary: ATP Lexicon - Sync Schemas
---

# com.atproto.sync Lexicon

Definitions related to cross-server sync in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.sync.getRepo

<mark>RPC query</mark> Gets the repo state.

Parameters:

- `did` Required string. The DID of the repo.
- `from` Optional string. A past commit CID

Response:

- Encoding: application/cbor

---

## com.atproto.sync.getRoot

<mark>RPC query</mark> Gets the current root CID of a repo.

Parameters:

- `did` Required string. The DID of the repo.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  root: string;
}
```

---

## com.atproto.sync.updateRepo

<mark>RPC procedure</mark> Writes commits to a repo.

QP options:

- `did` Required string. The DID of the repo.

Parameters:

- Encoding: application/cbor

<!-- END lex generated TOC please keep comment here to allow auto update -->