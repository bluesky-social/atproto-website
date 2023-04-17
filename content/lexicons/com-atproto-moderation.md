---
title: com.atproto.moderation
summary: ATP Lexicon - Moderation Schemas
---

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.moderation.createReport

```json
{
  "lexicon": 1,
  "id": "com.atproto.moderation.createReport",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Report a repo or a record.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "reasonType",
            "subject"
          ],
          "properties": {
            "reasonType": {
              "type": "ref",
              "ref": "com.atproto.moderation.defs#reasonType"
            },
            "reason": {
              "type": "string"
            },
            "subject": {
              "type": "union",
              "refs": [
                "com.atproto.admin.defs#repoRef",
                "com.atproto.repo.strongRef"
              ]
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "id",
            "reasonType",
            "subject",
            "reportedBy",
            "createdAt"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "reasonType": {
              "type": "ref",
              "ref": "com.atproto.moderation.defs#reasonType"
            },
            "reason": {
              "type": "string"
            },
            "subject": {
              "type": "union",
              "refs": [
                "com.atproto.admin.defs#repoRef",
                "com.atproto.repo.strongRef"
              ]
            },
            "reportedBy": {
              "type": "string",
              "format": "did"
            },
            "createdAt": {
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
---

## com.atproto.moderation.defs

```json
{
  "lexicon": 1,
  "id": "com.atproto.moderation.defs",
  "defs": {
    "reasonType": {
      "type": "string",
      "knownValues": [
        "com.atproto.moderation.defs#reasonSpam",
        "com.atproto.moderation.defs#reasonViolation",
        "com.atproto.moderation.defs#reasonMisleading",
        "com.atproto.moderation.defs#reasonSexual",
        "com.atproto.moderation.defs#reasonRude",
        "com.atproto.moderation.defs#reasonOther"
      ]
    },
    "reasonSpam": {
      "type": "token",
      "description": "Spam: frequent unwanted promotion, replies, mentions"
    },
    "reasonViolation": {
      "type": "token",
      "description": "Direct violation of server rules, laws, terms of service"
    },
    "reasonMisleading": {
      "type": "token",
      "description": "Misleading identity, affiliation, or content"
    },
    "reasonSexual": {
      "type": "token",
      "description": "Unwanted or mis-labeled sexual content"
    },
    "reasonRude": {
      "type": "token",
      "description": "Rude, harassing, explicit, or otherwise unwelcoming behavior"
    },
    "reasonOther": {
      "type": "token",
      "description": "Other: reports not falling under another report category"
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->