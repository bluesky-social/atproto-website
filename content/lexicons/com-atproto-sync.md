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

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getRepo",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets the repo state.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "description": "The DID of the repo."
          },
          "from": {
            "type": "string",
            "description": "A past commit CID."
          }
        }
      },
      "output": {
        "encoding": "application/cbor"
      }
    }
  }
}
```
---

## com.atproto.sync.getRoot

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getRoot",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets the current root CID of a repo.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "description": "The DID of the repo."
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "root"
          ],
          "properties": {
            "root": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```
---

## com.atproto.sync.updateRepo

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.updateRepo",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Writes commits to a repo.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "description": "The DID of the repo."
          }
        }
      },
      "input": {
        "encoding": "application/cbor"
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->