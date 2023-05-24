---
title: app.bsky.graph
summary: Bluesky Lexicon - Graph Schemas
---

# app.bsky.graph Lexicon

Definitions related to the social graph in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.graph.block

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.block",
  "defs": {
    "main": {
      "type": "record",
      "description": "A block.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "subject",
          "createdAt"
        ],
        "properties": {
          "subject": {
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
```
---

## app.bsky.graph.follow

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.follow",
  "defs": {
    "main": {
      "type": "record",
      "description": "A social follow.",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "subject",
          "createdAt"
        ],
        "properties": {
          "subject": {
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
```
---

## app.bsky.graph.getBlocks

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getBlocks",
  "defs": {
    "main": {
      "type": "query",
      "description": "Who is the requester's account blocking?",
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
            "blocks"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "blocks": {
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

## app.bsky.graph.getFollowers

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getFollowers",
  "defs": {
    "main": {
      "type": "query",
      "description": "Who is following an actor?",
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
            "subject",
            "followers"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "app.bsky.actor.defs#profileView"
            },
            "cursor": {
              "type": "string"
            },
            "followers": {
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

## app.bsky.graph.getFollows

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getFollows",
  "defs": {
    "main": {
      "type": "query",
      "description": "Who is an actor following?",
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
            "subject",
            "follows"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "app.bsky.actor.defs#profileView"
            },
            "cursor": {
              "type": "string"
            },
            "follows": {
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

## app.bsky.graph.getMutes

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getMutes",
  "defs": {
    "main": {
      "type": "query",
      "description": "Who does the viewer mute?",
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
            "mutes"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "mutes": {
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

## app.bsky.graph.muteActor

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.muteActor",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Mute an actor by did or handle.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "actor"
          ],
          "properties": {
            "actor": {
              "type": "string",
              "format": "at-identifier"
            }
          }
        }
      }
    }
  }
}
```
---

## app.bsky.graph.unmuteActor

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.unmuteActor",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Unmute an actor by did or handle.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "actor"
          ],
          "properties": {
            "actor": {
              "type": "string",
              "format": "at-identifier"
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->