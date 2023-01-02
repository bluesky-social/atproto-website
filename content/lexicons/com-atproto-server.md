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

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.getAccountsConfig",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get a document describing the service's accounts configuration.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "availableUserDomains"
          ],
          "properties": {
            "inviteCodeRequired": {
              "type": "boolean"
            },
            "availableUserDomains": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "links": {
              "type": "ref",
              "ref": "#links"
            }
          }
        }
      }
    },
    "links": {
      "type": "object",
      "properties": {
        "privacyPolicy": {
          "type": "string"
        },
        "termsOfService": {
          "type": "string"
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->