---
title: app.bsky.notification
summary: Bluesky Lexicon - Notification Schemas
---

# app.bsky.notification Lexicon

Definitions related to notifications.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.notification.getCount

```json
{
  "lexicon": 1,
  "id": "app.bsky.notification.getCount",
  "defs": {
    "main": {
      "type": "query",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "count"
          ],
          "properties": {
            "count": {
              "type": "integer"
            }
          }
        }
      }
    }
  }
}
```
---

## app.bsky.notification.list

```json
{
  "lexicon": 1,
  "id": "app.bsky.notification.list",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 50
          },
          "before": {
            "type": "string"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "notifications"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "notifications": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#notification"
              }
            }
          }
        }
      }
    },
    "notification": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "author",
        "reason",
        "record",
        "isRead",
        "indexedAt"
      ],
      "properties": {
        "uri": {
          "type": "string"
        },
        "cid": {
          "type": "string"
        },
        "author": {
          "type": "ref",
          "ref": "app.bsky.actor.ref#withInfo"
        },
        "reason": {
          "type": "string",
          "description": "Expected values are 'vote', 'repost', 'trend', 'follow', 'invite', 'mention' and 'reply'.",
          "knownValues": [
            "vote",
            "repost",
            "trend",
            "follow",
            "invite",
            "mention",
            "reply"
          ]
        },
        "reasonSubject": {
          "type": "string"
        },
        "record": {
          "type": "unknown"
        },
        "isRead": {
          "type": "boolean"
        },
        "indexedAt": {
          "type": "datetime"
        }
      }
    }
  }
}
```
---

## app.bsky.notification.updateSeen

```json
{
  "lexicon": 1,
  "id": "app.bsky.notification.updateSeen",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Notify server that the user has seen notifications.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "seenAt"
          ],
          "properties": {
            "seenAt": {
              "type": "datetime"
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->