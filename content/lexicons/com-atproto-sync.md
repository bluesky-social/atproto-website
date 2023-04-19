---
title: com.atproto.sync
summary: ATP Lexicon - Sync Schemas
---

# com.atproto.sync Lexicon

Definitions related to cross-server sync in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.sync.getBlob

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getBlob",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get a blob associated with a given repo.",
      "parameters": {
        "type": "params",
        "required": [
          "did",
          "cid"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "cid": {
            "type": "string",
            "format": "cid",
            "description": "The CID of the blob to fetch"
          }
        }
      },
      "output": {
        "encoding": "*/*"
      }
    }
  }
}
```
---

## com.atproto.sync.getBlocks

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getBlocks",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets blocks from a given repo.",
      "parameters": {
        "type": "params",
        "required": [
          "did",
          "cids"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "cids": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "cid"
            }
          }
        }
      },
      "output": {
        "encoding": "application/vnd.ipld.car"
      }
    }
  }
}
```
---

## com.atproto.sync.getCheckout

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getCheckout",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets the repo state.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "commit": {
            "type": "string",
            "format": "cid",
            "description": "The commit to get the checkout from. Defaults to current HEAD."
          }
        }
      },
      "output": {
        "encoding": "application/vnd.ipld.car"
      }
    }
  }
}
```
---

## com.atproto.sync.getCommitPath

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getCommitPath",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets the path of repo commits",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "latest": {
            "type": "string",
            "format": "cid",
            "description": "The most recent commit"
          },
          "earliest": {
            "type": "string",
            "format": "cid",
            "description": "The earliest commit to start from"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "commits"
          ],
          "properties": {
            "commits": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "cid"
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

## com.atproto.sync.getHead

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getHead",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets the current HEAD CID of a repo.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "root"
          ],
          "properties": {
            "root": {
              "type": "string",
              "format": "cid"
            }
          }
        }
      }
    }
  }
}
```
---

## com.atproto.sync.getRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getRecord",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets blocks needed for existence or non-existence of record.",
      "parameters": {
        "type": "params",
        "required": [
          "did",
          "collection",
          "rkey"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "collection": {
            "type": "string",
            "format": "nsid"
          },
          "rkey": {
            "type": "string"
          },
          "commit": {
            "type": "string",
            "format": "cid",
            "description": "An optional past commit CID."
          }
        }
      },
      "output": {
        "encoding": "application/vnd.ipld.car"
      }
    }
  }
}
```
---

## com.atproto.sync.getRepo

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.getRepo",
  "defs": {
    "main": {
      "type": "query",
      "description": "Gets the repo state.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "earliest": {
            "type": "string",
            "format": "cid",
            "description": "The earliest commit in the commit range (not inclusive)"
          },
          "latest": {
            "type": "string",
            "format": "cid",
            "description": "The latest commit in the commit range (inclusive)"
          }
        }
      },
      "output": {
        "encoding": "application/vnd.ipld.car"
      }
    }
  }
}
```
---

## com.atproto.sync.listBlobs

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.listBlobs",
  "defs": {
    "main": {
      "type": "query",
      "description": "List blob cids for some range of commits",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did",
            "description": "The DID of the repo."
          },
          "latest": {
            "type": "string",
            "format": "cid",
            "description": "The most recent commit"
          },
          "earliest": {
            "type": "string",
            "format": "cid",
            "description": "The earliest commit to start from"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "cids"
          ],
          "properties": {
            "cids": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "cid"
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

## com.atproto.sync.listRepos

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.listRepos",
  "defs": {
    "main": {
      "type": "query",
      "description": "List dids and root cids of hosted repos",
      "parameters": {
        "type": "params",
        "properties": {
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 1000,
            "default": 500
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
            "repos"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "repos": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#repo"
              }
            }
          }
        }
      }
    },
    "repo": {
      "type": "object",
      "required": [
        "did",
        "head"
      ],
      "properties": {
        "did": {
          "type": "string",
          "format": "did"
        },
        "head": {
          "type": "string",
          "format": "cid"
        }
      }
    }
  }
}
```
---

## com.atproto.sync.notifyOfUpdate

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.notifyOfUpdate",
  "defs": {
    "main": {
      "type": "query",
      "description": "Notify a crawling service of a recent update. Often when a long break between updates causes the connection with the crawling service to break.",
      "parameters": {
        "type": "params",
        "required": [
          "hostname"
        ],
        "properties": {
          "hostname": {
            "type": "string",
            "description": "Hostname of the service that is notifying of update."
          }
        }
      }
    }
  }
}
```
---

## com.atproto.sync.requestCrawl

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.requestCrawl",
  "defs": {
    "main": {
      "type": "query",
      "description": "Request a service to persistently crawl hosted repos.",
      "parameters": {
        "type": "params",
        "required": [
          "hostname"
        ],
        "properties": {
          "hostname": {
            "type": "string",
            "description": "Hostname of the service that is requesting to be crawled."
          }
        }
      }
    }
  }
}
```
---

## com.atproto.sync.subscribeRepos

```json
{
  "lexicon": 1,
  "id": "com.atproto.sync.subscribeRepos",
  "defs": {
    "main": {
      "type": "subscription",
      "description": "Subscribe to repo updates",
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
            "#commit",
            "#handle",
            "#migrate",
            "#tombstone",
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
    "commit": {
      "type": "object",
      "required": [
        "seq",
        "rebase",
        "tooBig",
        "repo",
        "commit",
        "prev",
        "blocks",
        "ops",
        "blobs",
        "time"
      ],
      "nullable": [
        "prev"
      ],
      "properties": {
        "seq": {
          "type": "integer"
        },
        "rebase": {
          "type": "boolean"
        },
        "tooBig": {
          "type": "boolean"
        },
        "repo": {
          "type": "string",
          "format": "did"
        },
        "commit": {
          "type": "cid-link"
        },
        "prev": {
          "type": "cid-link"
        },
        "blocks": {
          "type": "bytes",
          "description": "CAR file containing relevant blocks",
          "maxLength": 1000000
        },
        "ops": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#repoOp"
          },
          "maxLength": 200
        },
        "blobs": {
          "type": "array",
          "items": {
            "type": "cid-link"
          }
        },
        "time": {
          "type": "string",
          "format": "datetime"
        }
      }
    },
    "handle": {
      "type": "object",
      "required": [
        "seq",
        "did",
        "handle",
        "time"
      ],
      "properties": {
        "seq": {
          "type": "integer"
        },
        "did": {
          "type": "string",
          "format": "did"
        },
        "handle": {
          "type": "string",
          "format": "handle"
        },
        "time": {
          "type": "string",
          "format": "datetime"
        }
      }
    },
    "migrate": {
      "type": "object",
      "required": [
        "seq",
        "did",
        "migrateTo",
        "time"
      ],
      "nullable": [
        "migrateTo"
      ],
      "properties": {
        "seq": {
          "type": "integer"
        },
        "did": {
          "type": "string",
          "format": "did"
        },
        "migrateTo": {
          "type": "string"
        },
        "time": {
          "type": "string",
          "format": "datetime"
        }
      }
    },
    "tombstone": {
      "type": "object",
      "required": [
        "seq",
        "did",
        "time"
      ],
      "properties": {
        "seq": {
          "type": "integer"
        },
        "did": {
          "type": "string",
          "format": "did"
        },
        "time": {
          "type": "string",
          "format": "datetime"
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
    },
    "repoOp": {
      "type": "object",
      "required": [
        "action",
        "path",
        "cid"
      ],
      "nullable": [
        "cid"
      ],
      "properties": {
        "action": {
          "type": "string",
          "knownValues": [
            "create",
            "update",
            "delete"
          ]
        },
        "path": {
          "type": "string"
        },
        "cid": {
          "type": "cid-link"
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->