---
title: app.bsky.notification
summary: Bluesky Lexicon - Notification Schemas
---

# app.bsky.notification Lexicon

Definitions related to notifications.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.notification.getUnreadCount

```json
{
  "lexicon": 1,
  "id": "app.bsky.notification.getUnreadCount",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "properties": {
          "seenAt": {
            "type": "string",
            "format": "datetime"
          }
        }
      },
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

## app.bsky.notification.listNotifications

```json
{
  "lexicon": 1,
  "id": "app.bsky.notification.listNotifications",
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
          "cursor": {
            "type": "string"
          },
          "seenAt": {
            "type": "string",
            "format": "datetime"
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
          "type": "string",
          "format": "at-uri"
        },
        "cid": {
          "type": "string",
          "format": "cid"
        },
        "author": {
          "type": "ref",
          "ref": "app.bsky.actor.defs#profileView"
        },
        "reason": {
          "type": "string",
          "description": "Expected values are 'like', 'repost', 'follow', 'mention', 'reply', and 'quote'.",
          "knownValues": [
            "like",
            "repost",
            "follow",
            "mention",
            "reply",
            "quote"
          ]
        },
        "reasonSubject": {
          "type": "string",
          "format": "at-uri"
        },
        "record": {
          "type": "unknown"
        },
        "isRead": {
          "type": "boolean"
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.label.defs#label"
          }
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
              "type": "string",
              "format": "datetime"
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->