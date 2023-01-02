---
title: com.atproto.session
summary: ATP Lexicon - Session Schemas
---

# com.atproto.session Lexicon

Definitions related to session-management in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.session.create

```json
{
  "lexicon": 1,
  "id": "com.atproto.session.create",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an authentication session.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "handle",
            "password"
          ],
          "properties": {
            "handle": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "accessJwt",
            "refreshJwt",
            "handle",
            "did"
          ],
          "properties": {
            "accessJwt": {
              "type": "string"
            },
            "refreshJwt": {
              "type": "string"
            },
            "handle": {
              "type": "string"
            },
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
---

## com.atproto.session.delete

```json
{
  "lexicon": 1,
  "id": "com.atproto.session.delete",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Delete the current session."
    }
  }
}
```
---

## com.atproto.session.get

```json
{
  "lexicon": 1,
  "id": "com.atproto.session.get",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get information about the current session.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "handle",
            "did"
          ],
          "properties": {
            "handle": {
              "type": "string"
            },
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
---

## com.atproto.session.refresh

```json
{
  "lexicon": 1,
  "id": "com.atproto.session.refresh",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Refresh an authentication session.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "accessJwt",
            "refreshJwt",
            "handle",
            "did"
          ],
          "properties": {
            "accessJwt": {
              "type": "string"
            },
            "refreshJwt": {
              "type": "string"
            },
            "handle": {
              "type": "string"
            },
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