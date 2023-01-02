---
title: app.bsky.graph
summary: Bluesky Lexicon - Graph Schemas
---

# app.bsky.graph Lexicon

Definitions related to the social graph in Bluesky.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## app.bsky.graph.assertCreator

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.assertCreator",
  "defs": {
    "main": {
      "type": "token",
      "description": "Assertion type: Creator. Defined for app.bsky.graph.assertions's assertion."
    }
  }
}
```
---

## app.bsky.graph.assertMember

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.assertMember",
  "defs": {
    "main": {
      "type": "token",
      "description": "Assertion type: Member. Defined for app.bsky.graph.assertions's assertion."
    }
  }
}
```
---

## app.bsky.graph.assertion

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.assertion",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "assertion",
          "subject",
          "createdAt"
        ],
        "properties": {
          "assertion": {
            "type": "string"
          },
          "subject": {
            "type": "ref",
            "ref": "app.bsky.actor.ref"
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

## app.bsky.graph.confirmation

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.confirmation",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": [
          "originator",
          "assertion",
          "createdAt"
        ],
        "properties": {
          "originator": {
            "type": "ref",
            "ref": "app.bsky.actor.ref"
          },
          "assertion": {
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
            "type": "ref",
            "ref": "app.bsky.actor.ref"
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

## app.bsky.graph.getAssertions

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getAssertions",
  "defs": {
    "main": {
      "type": "query",
      "description": "General-purpose query for assertions.",
      "parameters": {
        "type": "params",
        "properties": {
          "author": {
            "type": "string"
          },
          "subject": {
            "type": "string"
          },
          "assertion": {
            "type": "string"
          },
          "confirmed": {
            "type": "boolean"
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
            "assertions"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "assertions": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#assertion"
              }
            }
          }
        }
      }
    },
    "assertion": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "assertion",
        "author",
        "subject",
        "indexedAt",
        "createdAt"
      ],
      "properties": {
        "uri": {
          "type": "string"
        },
        "cid": {
          "type": "string"
        },
        "assertion": {
          "type": "string"
        },
        "confirmation": {
          "type": "ref",
          "ref": "#confirmation"
        },
        "author": {
          "type": "ref",
          "ref": "app.bsky.actor.ref#withInfo"
        },
        "subject": {
          "type": "ref",
          "ref": "app.bsky.actor.ref#withInfo"
        },
        "indexedAt": {
          "type": "datetime"
        },
        "createdAt": {
          "type": "datetime"
        }
      }
    },
    "confirmation": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "indexedAt",
        "createdAt"
      ],
      "properties": {
        "uri": {
          "type": "string"
        },
        "cid": {
          "type": "string"
        },
        "indexedAt": {
          "type": "datetime"
        },
        "createdAt": {
          "type": "datetime"
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
      "description": "Who is following a user?",
      "parameters": {
        "type": "params",
        "required": [
          "user"
        ],
        "properties": {
          "user": {
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
            "subject",
            "followers"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "app.bsky.actor.ref#withInfo"
            },
            "cursor": {
              "type": "string"
            },
            "followers": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#follower"
              }
            }
          }
        }
      }
    },
    "follower": {
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

## app.bsky.graph.getFollows

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getFollows",
  "defs": {
    "main": {
      "type": "query",
      "description": "Who is a user following?",
      "parameters": {
        "type": "params",
        "required": [
          "user"
        ],
        "properties": {
          "user": {
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
            "subject",
            "follows"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "app.bsky.actor.ref#withInfo"
            },
            "cursor": {
              "type": "string"
            },
            "follows": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#follow"
              }
            }
          }
        }
      }
    },
    "follow": {
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

## app.bsky.graph.getMembers

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getMembers",
  "defs": {
    "main": {
      "type": "query",
      "description": "Who is a member of the group?",
      "parameters": {
        "type": "params",
        "required": [
          "actor"
        ],
        "properties": {
          "actor": {
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
            "subject",
            "members"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "app.bsky.actor.ref#withInfo"
            },
            "cursor": {
              "type": "string"
            },
            "members": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#member"
              }
            }
          }
        }
      }
    },
    "member": {
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

## app.bsky.graph.getMemberships

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.getMemberships",
  "defs": {
    "main": {
      "type": "query",
      "description": "Which groups is the actor a member of?",
      "parameters": {
        "type": "params",
        "required": [
          "actor"
        ],
        "properties": {
          "actor": {
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
            "subject",
            "memberships"
          ],
          "properties": {
            "subject": {
              "type": "ref",
              "ref": "app.bsky.actor.ref#withInfo"
            },
            "cursor": {
              "type": "string"
            },
            "memberships": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#membership"
              }
            }
          }
        }
      }
    },
    "membership": {
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
                "ref": "#mute"
              }
            }
          }
        }
      }
    },
    "mute": {
      "type": "object",
      "required": [
        "did",
        "declaration",
        "handle",
        "createdAt"
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
        "createdAt": {
          "type": "datetime"
        }
      }
    }
  }
}
```
---

## app.bsky.graph.mute

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.mute",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Mute an actor by did or handle.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "user"
          ],
          "properties": {
            "user": {
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

## app.bsky.graph.unmute

```json
{
  "lexicon": 1,
  "id": "app.bsky.graph.unmute",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Unmute an actor by did or handle.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "user"
          ],
          "properties": {
            "user": {
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