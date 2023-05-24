---
title: app.bsky.actor
summary: Bluesky Lexicon - Actor Schemas
---

# app.bsky.actor Lexicon

Definitions related to "actors," a general term for users in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.actor.defs

A reference to an actor in the network.

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.defs",
  "description": "A reference to an actor in the network.",
  "defs": {
    "profileViewBasic": {
      "type": "object",
      "required": [
        "did",
        "handle"
      ],
      "properties": {
        "did": {
          "type": "string",
          "format": "did"
        },
        "handle": {
          "type": "string",
          "format": "handle"
        },
        "displayName": {
          "type": "string",
          "maxGraphemes": 64,
          "maxLength": 640
        },
        "avatar": {
          "type": "string"
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
    "profileView": {
      "type": "object",
      "required": [
        "did",
        "handle"
      ],
      "properties": {
        "did": {
          "type": "string",
          "format": "did"
        },
        "handle": {
          "type": "string",
          "format": "handle"
        },
        "displayName": {
          "type": "string",
          "maxGraphemes": 64,
          "maxLength": 640
        },
        "description": {
          "type": "string",
          "maxGraphemes": 256,
          "maxLength": 2560
        },
        "avatar": {
          "type": "string"
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
    "profileViewDetailed": {
      "type": "object",
      "required": [
        "did",
        "handle"
      ],
      "properties": {
        "did": {
          "type": "string",
          "format": "did"
        },
        "handle": {
          "type": "string",
          "format": "handle"
        },
        "displayName": {
          "type": "string",
          "maxGraphemes": 64,
          "maxLength": 640
        },
        "description": {
          "type": "string",
          "maxGraphemes": 256,
          "maxLength": 2560
        },
        "avatar": {
          "type": "string"
        },
        "banner": {
          "type": "string"
        },
        "followersCount": {
          "type": "integer"
        },
        "followsCount": {
          "type": "integer"
        },
        "postsCount": {
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
        "muted": {
          "type": "boolean"
        },
        "blockedBy": {
          "type": "boolean"
        },
        "blocking": {
          "type": "string",
          "format": "at-uri"
        },
        "following": {
          "type": "string",
          "format": "at-uri"
        },
        "followedBy": {
          "type": "string",
          "format": "at-uri"
        }
      }
    }
  }
}
```
---

## app.bsky.actor.getProfile

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.getProfile",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "required": [
          "actor"
        ],
        "properties": {
          "actor": {
            "type": "string",
            "format": "at-identifier"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "app.bsky.actor.defs#profileViewDetailed"
        }
      }
    }
  }
}
```
---

## app.bsky.actor.getProfiles

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.getProfiles",
  "defs": {
    "main": {
      "type": "query",
      "parameters": {
        "type": "params",
        "required": [
          "actors"
        ],
        "properties": {
          "actors": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "at-identifier"
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
            "profiles"
          ],
          "properties": {
            "profiles": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "app.bsky.actor.defs#profileViewDetailed"
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

## app.bsky.actor.getSuggestions

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.getSuggestions",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get a list of actors suggested for following. Used in discovery UIs.",
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
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "actors"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "actors": {
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

## app.bsky.actor.profile

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.profile",
  "defs": {
    "main": {
      "type": "record",
      "key": "literal:self",
      "record": {
        "type": "object",
        "properties": {
          "displayName": {
            "type": "string",
            "maxGraphemes": 64,
            "maxLength": 640
          },
          "description": {
            "type": "string",
            "maxGraphemes": 256,
            "maxLength": 2560
          },
          "avatar": {
            "type": "blob",
            "accept": [
              "image/png",
              "image/jpeg"
            ],
            "maxSize": 1000000
          },
          "banner": {
            "type": "blob",
            "accept": [
              "image/png",
              "image/jpeg"
            ],
            "maxSize": 1000000
          }
        }
      }
    }
  }
}
```
---

## app.bsky.actor.searchActors

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.searchActors",
  "defs": {
    "main": {
      "type": "query",
      "description": "Find actors matching search criteria.",
      "parameters": {
        "type": "params",
        "properties": {
          "term": {
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
            "actors"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "actors": {
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

## app.bsky.actor.searchActorsTypeahead

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.searchActorsTypeahead",
  "defs": {
    "main": {
      "type": "query",
      "description": "Find actor suggestions for a search term.",
      "parameters": {
        "type": "params",
        "properties": {
          "term": {
            "type": "string"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 50
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "actors"
          ],
          "properties": {
            "actors": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "app.bsky.actor.defs#profileViewBasic"
              }
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->