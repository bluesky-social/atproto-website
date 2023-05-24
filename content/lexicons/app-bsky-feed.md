---
title: app.bsky.feed
summary: Bluesky Lexicon - Feed Schemas
---

# app.bsky.feed Lexicon

Definitions related to content & activity published in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.feed.defs

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.defs",
  "defs": {
    "postView": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "author",
        "record",
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
        "record": {
          "type": "unknown"
        },
        "embed": {
          "type": "union",
          "refs": [
            "app.bsky.embed.images#view",
            "app.bsky.embed.external#view",
            "app.bsky.embed.record#view",
            "app.bsky.embed.recordWithMedia#view"
          ]
        },
        "replyCount": {
          "type": "integer"
        },
        "repostCount": {
          "type": "integer"
        },
        "likeCount": {
          "type": "integer"
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "viewer": {
          "type": "ref",
          "ref": "#viewerState"
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
    "viewerState": {
      "type": "object",
      "properties": {
        "repost": {
          "type": "string",
          "format": "at-uri"
        },
        "like": {
          "type": "string",
          "format": "at-uri"
        }
      }
    },
    "feedViewPost": {
      "type": "object",
      "required": [
        "post"
      ],
      "properties": {
        "post": {
          "type": "ref",
          "ref": "app.bsky.feed.defs#postView"
        },
        "reply": {
          "type": "ref",
          "ref": "#replyRef"
        },
        "reason": {
          "type": "union",
          "refs": [
            "#reasonRepost"
          ]
        }
      }
    },
    "replyRef": {
      "type": "object",
      "required": [
        "root",
        "parent"
      ],
      "properties": {
        "root": {
          "type": "ref",
          "ref": "app.bsky.feed.defs#postView"
        },
        "parent": {
          "type": "ref",
          "ref": "app.bsky.feed.defs#postView"
        }
      }
    },
    "reasonRepost": {
      "type": "object",
      "required": [
        "by",
        "indexedAt"
      ],
      "properties": {
        "by": {
          "type": "ref",
          "ref": "app.bsky.actor.defs#profileViewBasic"
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        }
      }
    },
    "threadViewPost": {
      "type": "object",
      "required": [
        "post"
      ],
      "properties": {
        "post": {
          "type": "ref",
          "ref": "#postView"
        },
        "parent": {
          "type": "union",
          "refs": [
            "#threadViewPost",
            "#notFoundPost",
            "#blockedPost"
          ]
        },
        "replies": {
          "type": "array",
          "items": {
            "type": "union",
            "refs": [
              "#threadViewPost",
              "#notFoundPost",
              "#blockedPost"
            ]
          }
        }
      }
    },
    "notFoundPost": {
      "type": "object",
      "required": [
        "uri",
        "notFound"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "at-uri"
        },
        "notFound": {
          "type": "boolean",
          "const": true
        }
      }
    },
    "blockedPost": {
      "type": "object",
      "required": [
        "uri",
        "blocked"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "at-uri"
        },
        "blocked": {
          "type": "boolean",
          "const": true
        }
      }
    }
  }
}
```
---

## app.bsky.feed.getAuthorFeed

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getAuthorFeed",
  "defs": {
    "main": {
      "type": "query",
      "description": "A view of an actor's feed.",
      "parameters": {
        "type": "params",
        "required": [
          "actor"
        ],
        "properties": {
          "actor": {
            "type": "string",
            "format": "at-identifier"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
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
            "feed"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "feed": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "app.bsky.feed.defs#feedViewPost"
              }
            }
          }
        }
      },
      "errors": [
        {
          "name": "BlockedActor"
        },
        {
          "name": "BlockedByActor"
        }
      ]
    }
  }
}
```
---

## app.bsky.feed.getLikes

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getLikes",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "required": [
          "uri"
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
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
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
            "uri",
            "likes"
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
            "cursor": {
              "type": "string"
            },
            "likes": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#like"
              }
            }
          }
        }
      }
    },
    "like": {
      "type": "object",
      "required": [
        "indexedAt",
        "createdAt",
        "actor"
      ],
      "properties": {
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "actor": {
          "type": "ref",
          "ref": "app.bsky.actor.defs#profileView"
        }
      }
    }
  }
}
```
---

## app.bsky.feed.getPostThread

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getPostThread",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "required": [
          "uri"
        ],
        "properties": {
          "uri": {
            "type": "string",
            "format": "at-uri"
          },
          "depth": {
            "type": "integer"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "thread"
          ],
          "properties": {
            "thread": {
              "type": "union",
              "refs": [
                "app.bsky.feed.defs#threadViewPost",
                "app.bsky.feed.defs#notFoundPost",
                "app.bsky.feed.defs#blockedPost"
              ]
            }
          }
        }
      },
      "errors": [
        {
          "name": "NotFound"
        }
      ]
    }
  }
}
```
---

## app.bsky.feed.getPosts

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getPosts",
  "defs": {
    "main": {
      "type": "query",
      "description": "A view of an actor's feed.",
      "parameters": {
        "type": "params",
        "required": [
          "uris"
        ],
        "properties": {
          "uris": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "at-uri"
            },
            "maxLength": 25
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "posts"
          ],
          "properties": {
            "posts": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "app.bsky.feed.defs#postView"
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

## app.bsky.feed.getRepostedBy

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getRepostedBy",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "required": [
          "uri"
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
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
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
            "uri",
            "repostedBy"
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
            "cursor": {
              "type": "string"
            },
            "repostedBy": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "app.bsky.actor.defs#profileView"
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

## app.bsky.feed.getTimeline

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getTimeline",
  "defs": {
    "main": {
      "type": "query",
      "description": "A view of the user's home timeline.",
      "parameters": {
        "type": "params",
        "properties": {
          "algorithm": {
            "type": "string"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
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
            "feed"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "feed": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "app.bsky.feed.defs#feedViewPost"
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

## app.bsky.feed.like

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.like",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "subject",
          "createdAt"
        ],
        "properties": {
          "subject": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef"
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
```
---

## app.bsky.feed.post

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.post",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "text",
          "createdAt"
        ],
        "properties": {
          "text": {
            "type": "string",
            "maxLength": 3000,
            "maxGraphemes": 300
          },
          "entities": {
            "type": "array",
            "description": "Deprecated: replaced by app.bsky.richtext.facet.",
            "items": {
              "type": "ref",
              "ref": "#entity"
            }
          },
          "facets": {
            "type": "array",
            "items": {
              "type": "ref",
              "ref": "app.bsky.richtext.facet"
            }
          },
          "reply": {
            "type": "ref",
            "ref": "#replyRef"
          },
          "embed": {
            "type": "union",
            "refs": [
              "app.bsky.embed.images",
              "app.bsky.embed.external",
              "app.bsky.embed.record",
              "app.bsky.embed.recordWithMedia"
            ]
          },
          "createdAt": {
            "type": "string",
            "format": "datetime"
          }
        }
      }
    },
    "replyRef": {
      "type": "object",
      "required": [
        "root",
        "parent"
      ],
      "properties": {
        "root": {
          "type": "ref",
          "ref": "com.atproto.repo.strongRef"
        },
        "parent": {
          "type": "ref",
          "ref": "com.atproto.repo.strongRef"
        }
      }
    },
    "entity": {
      "type": "object",
      "description": "Deprecated: use facets instead.",
      "required": [
        "index",
        "type",
        "value"
      ],
      "properties": {
        "index": {
          "type": "ref",
          "ref": "#textSlice"
        },
        "type": {
          "type": "string",
          "description": "Expected values are 'mention' and 'link'."
        },
        "value": {
          "type": "string"
        }
      }
    },
    "textSlice": {
      "type": "object",
      "description": "Deprecated. Use app.bsky.richtext instead -- A text segment. Start is inclusive, end is exclusive. Indices are for utf16-encoded strings.",
      "required": [
        "start",
        "end"
      ],
      "properties": {
        "start": {
          "type": "integer",
          "minimum": 0
        },
        "end": {
          "type": "integer",
          "minimum": 0
        }
      }
    }
  }
}
```
---

## app.bsky.feed.repost

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.repost",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "subject",
          "createdAt"
        ],
        "properties": {
          "subject": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef"
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
```
---

## app.bsky.feed.getFeedSkeleton

We are actively developing Feed Generator integration into the Bluesky PDS. Though we are reasonably confident about the general shape laid out here, this lexicon is subject to change.

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getFeedSkeleton",
  "defs": {
    "main": {
      "type": "query",
      "description": "A skeleton of a feed provided by a feed generator",
      "parameters": {
        "type": "params",
        "required": ["feed"],
        "properties": {
          "feed": {"type": "string", "format": "at-uri"},
          "limit": {"type": "integer", "minimum": 1, "maximum": 100, "default": 50},
          "cursor": {"type": "string"}
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": ["feed"],
          "properties": {
            "cursor": {"type": "string"},
            "feed": {
              "type": "array",
              "items": {"type": "ref", "ref": "app.bsky.feed.defs#skeletonFeedPost"}
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->