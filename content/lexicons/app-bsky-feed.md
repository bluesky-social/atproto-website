---
title: app.bsky.feed
summary: Bluesky Lexicon - Feed Schemas
---

# app.bsky.feed Lexicon

Definitions related to content & activity published in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.feed.feedViewPost

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.feedViewPost",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "post"
      ],
      "properties": {
        "post": {
          "type": "ref",
          "ref": "app.bsky.feed.post#view"
        },
        "reply": {
          "type": "ref",
          "ref": "#replyRef"
        },
        "reason": {
          "type": "union",
          "refs": [
            "#reasonTrend",
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
          "ref": "app.bsky.feed.post#view"
        },
        "parent": {
          "type": "ref",
          "ref": "app.bsky.feed.post#view"
        }
      }
    },
    "reasonTrend": {
      "type": "object",
      "required": [
        "by",
        "indexedAt"
      ],
      "properties": {
        "by": {
          "type": "ref",
          "ref": "app.bsky.actor.ref#withInfo"
        },
        "indexedAt": {
          "type": "datetime"
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
          "ref": "app.bsky.actor.ref#withInfo"
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

## app.bsky.feed.getAuthorFeed

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getAuthorFeed",
  "defs": {
    "main": {
      "type": "query",
      "description": "A view of a user's feed.",
      "parameters": {
        "type": "params",
        "required": [
          "author"
        ],
        "properties": {
          "author": {
            "type": "string"
          },
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
                "ref": "app.bsky.feed.feedViewPost"
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
            "type": "string"
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
                "#threadViewPost",
                "#notFoundPost"
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
    },
    "threadViewPost": {
      "type": "object",
      "required": [
        "post"
      ],
      "properties": {
        "post": {
          "type": "ref",
          "ref": "app.bsky.feed.post#view"
        },
        "parent": {
          "type": "union",
          "refs": [
            "#threadViewPost",
            "#notFoundPost"
          ]
        },
        "replies": {
          "type": "array",
          "items": {
            "type": "union",
            "refs": [
              "#threadViewPost",
              "#notFoundPost"
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
          "type": "string"
        },
        "notFound": {
          "type": "boolean",
          "const": true
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
            "type": "string"
          },
          "cid": {
            "type": "string"
          },
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
            "uri",
            "repostedBy"
          ],
          "properties": {
            "uri": {
              "type": "string"
            },
            "cid": {
              "type": "string"
            },
            "cursor": {
              "type": "string"
            },
            "repostedBy": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#repostedBy"
              }
            }
          }
        }
      }
    },
    "repostedBy": {
      "type": "object",
      "required": [
        "did",
        "declaration",
        "handle",
        "indexedAt"
      ],
      "properties": {
        "did": {
          "type": "string"
        },
        "declaration": {
          "type": "ref",
          "ref": "app.bsky.system.declRef"
        },
        "handle": {
          "type": "string"
        },
        "displayName": {
          "type": "string",
          "maxLength": 64
        },
        "avatar": {
          "type": "string"
        },
        "createdAt": {
          "type": "datetime"
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
                "ref": "app.bsky.feed.feedViewPost"
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

## app.bsky.feed.getVotes

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.getVotes",
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
            "type": "string"
          },
          "cid": {
            "type": "string"
          },
          "direction": {
            "type": "string",
            "enum": [
              "up",
              "down"
            ]
          },
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
            "uri",
            "votes"
          ],
          "properties": {
            "uri": {
              "type": "string"
            },
            "cid": {
              "type": "string"
            },
            "cursor": {
              "type": "string"
            },
            "votes": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#vote"
              }
            }
          }
        }
      }
    },
    "vote": {
      "type": "object",
      "required": [
        "direction",
        "indexedAt",
        "createdAt",
        "actor"
      ],
      "properties": {
        "direction": {
          "type": "string",
          "enum": [
            "up",
            "down"
          ]
        },
        "indexedAt": {
          "type": "datetime"
        },
        "createdAt": {
          "type": "datetime"
        },
        "actor": {
          "type": "ref",
          "ref": "app.bsky.actor.ref#withInfo"
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
            "maxLength": 256
          },
          "entities": {
            "type": "array",
            "items": {
              "type": "ref",
              "ref": "#entity"
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
              "app.bsky.embed.external"
            ]
          },
          "createdAt": {
            "type": "datetime"
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
          "description": "Expected values are 'mention', 'hashtag', and 'link'."
        },
        "value": {
          "type": "string"
        }
      }
    },
    "textSlice": {
      "type": "object",
      "description": "A text segment. Start is inclusive, end is exclusive.",
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
    },
    "view": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "author",
        "record",
        "replyCount",
        "repostCount",
        "upvoteCount",
        "downvoteCount",
        "indexedAt",
        "viewer"
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
        "record": {
          "type": "unknown"
        },
        "embed": {
          "type": "union",
          "refs": [
            "app.bsky.embed.images#presented",
            "app.bsky.embed.external#presented"
          ]
        },
        "replyCount": {
          "type": "integer"
        },
        "repostCount": {
          "type": "integer"
        },
        "upvoteCount": {
          "type": "integer"
        },
        "downvoteCount": {
          "type": "integer"
        },
        "indexedAt": {
          "type": "datetime"
        },
        "viewer": {
          "type": "ref",
          "ref": "#viewerState"
        }
      }
    },
    "viewerState": {
      "type": "object",
      "properties": {
        "repost": {
          "type": "string"
        },
        "upvote": {
          "type": "string"
        },
        "downvote": {
          "type": "string"
        },
        "muted": {
          "type": "boolean"
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
            "type": "datetime"
          }
        }
      }
    }
  }
}
```
---

## app.bsky.feed.setVote

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.setVote",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Upvote, downvote, or clear the user's vote for a post.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "subject",
            "direction"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "com.atproto.repo.strongRef"
            },
            "direction": {
              "type": "string",
              "enum": [
                "up",
                "down",
                "none"
              ]
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "properties": {
            "upvote": {
              "type": "string"
            },
            "downvote": {
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

## app.bsky.feed.trend

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.trend",
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
            "type": "datetime"
          }
        }
      }
    }
  }
}
```
---

## app.bsky.feed.vote

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.vote",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "subject",
          "direction",
          "createdAt"
        ],
        "properties": {
          "subject": {
            "type": "ref",
            "ref": "com.atproto.repo.strongRef"
          },
          "direction": {
            "type": "string",
            "enum": [
              "up",
              "down"
            ]
          },
          "createdAt": {
            "type": "datetime"
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->