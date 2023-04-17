---
title: com.atproto.label
summary: ATP Lexicon - Label Schemas
---

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.label.defs

```json
{
  "lexicon": 1,
  "id": "com.atproto.label.defs",
  "defs": {
    "label": {
      "type": "object",
      "description": "Metadata tag on an atproto resource (eg, repo or record)",
      "required": [
        "src",
        "uri",
        "val",
        "cts"
      ],
      "properties": {
        "src": {
          "type": "string",
          "format": "did",
          "description": "DID of the actor who created this label"
        },
        "uri": {
          "type": "string",
          "format": "uri",
          "description": "AT URI of the record, repository (account), or other resource which this label applies to"
        },
        "cid": {
          "type": "string",
          "format": "cid",
          "description": "optionally, CID specifying the specific version of 'uri' resource this label applies to"
        },
        "val": {
          "type": "string",
          "maxLength": 128,
          "description": "the short string name of the value or type of this label"
        },
        "neg": {
          "type": "boolean",
          "description": "if true, this is a negation label, overwriting a previous label"
        },
        "cts": {
          "type": "string",
          "format": "datetime",
          "description": "timestamp when this label was created"
        }
      }
    }
  }
}
```
---

## com.atproto.label.queryLabels

```json
{
  "lexicon": 1,
  "id": "com.atproto.label.queryLabels",
  "defs": {
    "main": {
      "type": "query",
      "description": "Find labels relevant to the provided URI patterns.",
      "parameters": {
        "type": "params",
        "required": [
          "uriPatterns"
        ],
        "properties": {
          "uriPatterns": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "List of AT URI patterns to match (boolean 'OR'). Each may be a prefix (ending with '*'; will match inclusive of the string leading to '*'), or a full URI"
          },
          "sources": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "did"
            },
            "description": "Optional list of label sources (DIDs) to filter on"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 250,
            "default": 50
          },
          "cursor": {
            "type": "string"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "labels"
          ],
          "properties": {
            "cursor": {
              "type": "string"
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
  }
}
```
---

## com.atproto.label.subscribeLabels

```json
{
  "lexicon": 1,
  "id": "com.atproto.label.subscribeLabels",
  "defs": {
    "main": {
      "type": "subscription",
      "description": "Subscribe to label updates",
      "parameters": {
        "type": "params",
        "properties": {
          "cursor": {
            "type": "integer",
            "description": "The last known event to backfill from."
          }
        }
      },
      "message": {
        "schema": {
          "type": "union",
          "refs": [
            "#labels",
            "#info"
          ]
        }
      },
      "errors": [
        {
          "name": "FutureCursor"
        }
      ]
    },
    "labels": {
      "type": "object",
      "required": [
        "seq",
        "labels"
      ],
      "properties": {
        "seq": {
          "type": "integer"
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.label.defs#label"
          }
        }
      }
    },
    "info": {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        "name": {
          "type": "string",
          "knownValues": [
            "OutdatedCursor"
          ]
        },
        "message": {
          "type": "string"
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->