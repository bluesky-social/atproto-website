---
title: com.atproto.server
summary: ATP Lexicon - Server Schemas
---

# com.atproto.server Lexicon

Definitions related to server behaviors in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.server.getAccountsConfig

<mark>RPC query</mark> Get a document describing the service's accounts configuration.


Response:

- Encoding: application/json
- Schema:

```typescript
export interface Response {
  inviteCodeRequired?: boolean;
  availableUserDomains: string[];
}
```

<!-- END lex generated TOC please keep comment here to allow auto update -->