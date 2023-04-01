---
title: app.bsky.richtext
summary: Bluesky Lexicon - Richtext Schemas
---

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->

## app.bsky.richtext.facet

```json
{
  "lexicon": 1,
  "id": "app.bsky.richtext.facet",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "index",
        "features"
      ],
      "properties": {
        "index": {
          "type": "ref",
          "ref": "#byteSlice"
        },
        "features": {
          "type": "array",
          "items": {
            "type": "union",
            "refs": [
              "#mention",
              "#link"
            ]
          }
        }
      }
    },
    "mention": {
      "type": "object",
      "description": "A facet feature for actor mentions.",
      "required": [
        "did"
      ],
      "properties": {
        "did": {
          "type": "string",
          "format": "did"
        }
      }
    },
    "link": {
      "type": "object",
      "description": "A facet feature for links.",
      "required": [
        "uri"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "uri"
        }
      }
    },
    "byteSlice": {
      "type": "object",
      "description": "A text segment. Start is inclusive, end is exclusive. Indices are for utf8-encoded strings.",
      "required": [
        "byteStart",
        "byteEnd"
      ],
      "properties": {
        "byteStart": {
          "type": "integer",
          "minimum": 0
        },
        "byteEnd": {
          "type": "integer",
          "minimum": 0
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->