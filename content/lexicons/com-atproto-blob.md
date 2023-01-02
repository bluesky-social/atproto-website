---
title: com.atproto.blob
summary: ATP Lexicon - Blob Schemas
---

# com.atproto.blob Lexicon

Definitions related to blob management in ATP services. ("Blobs" are unstructured data such as images or videos.)

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.blob.upload

```json
{
  "lexicon": 1,
  "id": "com.atproto.blob.upload",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Upload a new blob to be added to repo in a later request.",
      "input": {
        "encoding": "*/*"
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "cid"
          ],
          "properties": {
            "cid": {
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