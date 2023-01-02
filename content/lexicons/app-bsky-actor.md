---
title: app.bsky.actor
summary: Bluesky Lexicon - Actor Schemas
---

# app.bsky.actor Lexicon

Definitions related to "actors," a general term for users in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.actor.createScene

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.createScene",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create a scene.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "handle"
          ],
          "properties": {
            "handle": {
              "type": "string"
            },
            "recoveryKey": {
              "type": "string"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "handle",
            "did",
            "declaration"
          ],
          "properties": {
            "handle": {
              "type": "string"
            },
            "did": {
              "type": "string"
            },
            "declaration": {
              "type": "ref",
              "ref": "app.bsky.system.declRef"
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidHandle"
        },
        {
          "name": "HandleNotAvailable"
        }
      ]
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
            "type": "string"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "did",
            "declaration",
            "handle",
            "creator",
            "followersCount",
            "followsCount",
            "membersCount",
            "postsCount"
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
            "creator": {
              "type": "string"
            },
            "displayName": {
              "type": "string",
              "maxLength": 64
            },
            "description": {
              "type": "string",
              "maxLength": 256
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
            "membersCount": {
              "type": "integer"
            },
            "postsCount": {
              "type": "integer"
            },
            "myState": {
              "type": "ref",
              "ref": "#myState"
            }
          }
        }
      }
    },
    "myState": {
      "type": "object",
      "properties": {
        "follow": {
          "type": "string"
        },
        "member": {
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
                "ref": "#actor"
              }
            }
          }
        }
      }
    },
    "actor": {
      "type": "object",
      "required": [
        "did",
        "declaration",
        "handle"
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
        "description": {
          "type": "string"
        },
        "avatar": {
          "type": "string"
        },
        "indexedAt": {
          "type": "datetime"
        },
        "myState": {
          "type": "ref",
          "ref": "#myState"
        }
      }
    },
    "myState": {
      "type": "object",
      "properties": {
        "follow": {
          "type": "string"
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
        "required": [
          "displayName"
        ],
        "properties": {
          "displayName": {
            "type": "string",
            "maxLength": 64
          },
          "description": {
            "type": "string",
            "maxLength": 256
          },
          "avatar": {
            "type": "image",
            "accept": [
              "image/png",
              "image/jpeg"
            ],
            "maxWidth": 1000,
            "maxHeight": 1000,
            "maxSize": 300000
          },
          "banner": {
            "type": "image",
            "accept": [
              "image/png",
              "image/jpeg"
            ],
            "maxWidth": 3000,
            "maxHeight": 1000,
            "maxSize": 500000
          }
        }
      }
    }
  }
}
```
---

## app.bsky.actor.ref

A reference to an actor in the network.

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.ref",
  "description": "A reference to an actor in the network.",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "did",
        "declarationCid"
      ],
      "properties": {
        "did": {
          "type": "string"
        },
        "declarationCid": {
          "type": "string"
        }
      }
    },
    "withInfo": {
      "type": "object",
      "required": [
        "did",
        "declaration",
        "handle"
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
        "viewer": {
          "type": "ref",
          "ref": "#viewerState"
        }
      }
    },
    "viewerState": {
      "type": "object",
      "properties": {
        "muted": {
          "type": "boolean"
        }
      }
    }
  }
}
```
---

## app.bsky.actor.search

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.search",
  "defs": {
    "main": {
      "type": "query",
      "description": "Find users matching search criteria.",
      "parameters": {
        "type": "params",
        "required": [
          "term"
        ],
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
            "users"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "users": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#user"
              }
            }
          }
        }
      }
    },
    "user": {
      "type": "object",
      "required": [
        "did",
        "declaration",
        "handle"
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
        "description": {
          "type": "string"
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

## app.bsky.actor.searchTypeahead

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.searchTypeahead",
  "defs": {
    "main": {
      "type": "query",
      "description": "Find user suggestions for a search term.",
      "parameters": {
        "type": "params",
        "required": [
          "term"
        ],
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
            "users"
          ],
          "properties": {
            "users": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#user"
              }
            }
          }
        }
      }
    },
    "user": {
      "type": "object",
      "required": [
        "did",
        "declaration",
        "handle"
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
        }
      }
    }
  }
}
```
---

## app.bsky.actor.updateProfile

```json
{
  "lexicon": 1,
  "id": "app.bsky.actor.updateProfile",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Notify server that the user has seen notifications.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "properties": {
            "did": {
              "type": "string"
            },
            "displayName": {
              "type": "string",
              "maxLength": 64
            },
            "description": {
              "type": "string",
              "maxLength": 256
            },
            "avatar": {
              "type": "image",
              "accept": [
                "image/png",
                "image/jpeg"
              ],
              "maxWidth": 500,
              "maxHeight": 500,
              "maxSize": 100000
            },
            "banner": {
              "type": "image",
              "accept": [
                "image/png",
                "image/jpeg"
              ],
              "maxWidth": 1500,
              "maxHeight": 500,
              "maxSize": 500000
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "uri",
            "cid",
            "record"
          ],
          "properties": {
            "uri": {
              "type": "string"
            },
            "cid": {
              "type": "string"
            },
            "record": {
              "type": "unknown"
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidBlob"
        },
        {
          "name": "BlobTooLarge"
        },
        {
          "name": "InvalidMimeType"
        },
        {
          "name": "InvalidImageDimensions"
        }
      ]
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->