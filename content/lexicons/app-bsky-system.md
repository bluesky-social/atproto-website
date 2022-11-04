---
title: app.bsky.system
summary: Bluesky Lexicon - System Schemas
---

# app.bsky.system Lexicon

Definitions related to system data, often meant to be used for core definitions.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.system.declaration

<mark>Record type</mark> Context for an account that is considered intrinsic to it and alters the fundamental understanding of an account of changed. A declaration should be treated as immutable.

```typescript
export type ActorKnown = "app.bsky.system.actorUser" | "app.bsky.system.actorScene";
export type ActorUnknown = string;

export interface Record {
  actorType: ActorKnown | ActorUnknown;
}
```

---

## app.bsky.system.actorScene

<mark>Token</mark> Actor type: Scene. Defined for app.bsky.system.declaration's actorType.

---

## app.bsky.system.actorUser

<mark>Token</mark> Actor type: User. Defined for app.bsky.system.declaration's actorType.

<!-- END lex generated TOC please keep comment here to allow auto update -->