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

```json
{
  "lexicon": 1,
  "id": "com.atproto.handle.resolve",
  "defs": {
    "main": {
      "type": "query",
      "description": "Provides the DID of a repo.",
      "parameters": {
        "type": "params",
        "properties": {
          "handle": {
            "type": "string",
            "description": "The handle to resolve. If not supplied, will resolve the host's own handle."
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "did"
          ],
          "properties": {
            "did": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->