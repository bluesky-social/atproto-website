---
title: app.bsky.embed
summary: Bluesky Lexicon - Embed Schemas
---

# app.bsky.embed Lexicon

Definitions related to "embeds," content which is embedded within other records (e.g. links or images in posts).

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.embed.external

A representation of some externally linked content, embedded in another form of content

```json
{
  "lexicon": 1,
  "id": "app.bsky.embed.external",
  "description": "A representation of some externally linked content, embedded in another form of content",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "external"
      ],
      "properties": {
        "external": {
          "type": "ref",
          "ref": "#external"
        }
      }
    },
    "external": {
      "type": "object",
      "required": [
        "uri",
        "title",
        "description"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "uri"
        },
        "title": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "thumb": {
          "type": "blob",
          "accept": [
            "image/*"
          ],
          "maxSize": 1000000
        }
      }
    },
    "view": {
      "type": "object",
      "required": [
        "external"
      ],
      "properties": {
        "external": {
          "type": "ref",
          "ref": "#viewExternal"
        }
      }
    },
    "viewExternal": {
      "type": "object",
      "required": [
        "uri",
        "title",
        "description"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "uri"
        },
        "title": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "thumb": {
          "type": "string"
        }
      }
    }
  }
}
```
---

## app.bsky.embed.images

A set of images embedded in some other form of content

```json
{
  "lexicon": 1,
  "id": "app.bsky.embed.images",
  "description": "A set of images embedded in some other form of content",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "images"
      ],
      "properties": {
        "images": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#image"
          },
          "maxLength": 4
        }
      }
    },
    "image": {
      "type": "object",
      "required": [
        "image",
        "alt"
      ],
      "properties": {
        "image": {
          "type": "blob",
          "accept": [
            "image/*"
          ],
          "maxSize": 1000000
        },
        "alt": {
          "type": "string"
        }
      }
    },
    "view": {
      "type": "object",
      "required": [
        "images"
      ],
      "properties": {
        "images": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#viewImage"
          },
          "maxLength": 4
        }
      }
    },
    "viewImage": {
      "type": "object",
      "required": [
        "thumb",
        "fullsize",
        "alt"
      ],
      "properties": {
        "thumb": {
          "type": "string"
        },
        "fullsize": {
          "type": "string"
        },
        "alt": {
          "type": "string"
        }
      }
    }
  }
}
```
---

## app.bsky.embed.record

A representation of a record embedded in another form of content

```json
{
  "lexicon": 1,
  "id": "app.bsky.embed.record",
  "description": "A representation of a record embedded in another form of content",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "record"
      ],
      "properties": {
        "record": {
          "type": "ref",
          "ref": "com.atproto.repo.strongRef"
        }
      }
    },
    "view": {
      "type": "object",
      "required": [
        "record"
      ],
      "properties": {
        "record": {
          "type": "union",
          "refs": [
            "#viewRecord",
            "#viewNotFound",
            "#viewBlocked"
          ]
        }
      }
    },
    "viewRecord": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "author",
        "value",
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
          "ref": "app.bsky.actor.defs#profileViewBasic"
        },
        "value": {
          "type": "unknown"
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.label.defs#label"
          }
        },
        "embeds": {
          "type": "array",
          "items": {
            "type": "union",
            "refs": [
              "app.bsky.embed.images#view",
              "app.bsky.embed.external#view",
              "app.bsky.embed.record#view",
              "app.bsky.embed.recordWithMedia#view"
            ]
          }
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        }
      }
    },
    "viewNotFound": {
      "type": "object",
      "required": [
        "uri"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "at-uri"
        }
      }
    },
    "viewBlocked": {
      "type": "object",
      "required": [
        "uri"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "at-uri"
        }
      }
    }
  }
}
```
---

## app.bsky.embed.recordWithMedia

A representation of a record embedded in another form of content, alongside other compatible embeds

```json
{
  "lexicon": 1,
  "id": "app.bsky.embed.recordWithMedia",
  "description": "A representation of a record embedded in another form of content, alongside other compatible embeds",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "record",
        "media"
      ],
      "properties": {
        "record": {
          "type": "ref",
          "ref": "app.bsky.embed.record"
        },
        "media": {
          "type": "union",
          "refs": [
            "app.bsky.embed.images",
            "app.bsky.embed.external"
          ]
        }
      }
    },
    "view": {
      "type": "object",
      "required": [
        "record",
        "media"
      ],
      "properties": {
        "record": {
          "type": "ref",
          "ref": "app.bsky.embed.record#view"
        },
        "media": {
          "type": "union",
          "refs": [
            "app.bsky.embed.images#view",
            "app.bsky.embed.external#view"
          ]
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->