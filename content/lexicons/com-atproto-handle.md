---
title: com.atproto.handle
summary: ATP Lexicon - Handle Schemas
---

# com.atproto.handle Lexicon

Definitions related to handles (aka usernames) in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.handle.resolve

<mark>RPC query</mark> Provides the DID of a repo.

Parameters:

- `handle` Optional string. The handle to resolve. If not supplied, will resolve the host's own handle.

Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  did: string;
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->