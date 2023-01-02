---
title: app.bsky.system
summary: Bluesky Lexicon - System Schemas
---

# app.bsky.system Lexicon

Definitions related to system data, often meant to be used for core definitions.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.system.actorScene

```json
{
  "lexicon": 1,
  "id": "app.bsky.system.actorScene",
  "defs": {
    "main": {
      "type": "token",
      "description": "Actor type: Scene. Defined for app.bsky.system.declaration's actorType."
    }
  }
}
```
---

## app.bsky.system.actorUser

```json
{
  "lexicon": 1,
  "id": "app.bsky.system.actorUser",
  "defs": {
    "main": {
      "type": "token",
      "description": "Actor type: User. Defined for app.bsky.system.declaration's actorType."
    }
  }
}
```
---

## app.bsky.system.declRef

```json
{
  "lexicon": 1,
  "id": "app.bsky.system.declRef",
  "defs": {
    "main": {
      "description": "A reference to a app.bsky.system.declaration record.",
      "type": "object",
      "required": [
        "cid",
        "actorType"
      ],
      "properties": {
        "cid": {
          "type": "string"
        },
        "actorType": {
          "type": "string",
          "knownValues": [
            "app.bsky.system.actorUser",
            "app.bsky.system.actorScene"
          ]
        }
      }
    }
  }
}
```
---

## app.bsky.system.declaration

```json
{
  "lexicon": 1,
  "id": "app.bsky.system.declaration",
  "defs": {
    "main": {
      "description": "Context for an account that is considered intrinsic to it and alters the fundamental understanding of an account of changed. A declaration should be treated as immutable.",
      "type": "record",
      "key": "literal:self",
      "record": {
        "type": "object",
        "required": [
          "actorType"
        ],
        "properties": {
          "actorType": {
            "type": "string",
            "knownValues": [
              "app.bsky.system.actorUser",
              "app.bsky.system.actorScene"
            ]
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->