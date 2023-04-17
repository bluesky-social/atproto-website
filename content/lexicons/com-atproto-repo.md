---
title: com.atproto.repo
summary: ATP Lexicon - Repo Schemas
---

# com.atproto.repo Lexicon

Definitions related to repositories in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.repo.applyWrites

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.applyWrites",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Apply a batch transaction of creates, updates, and deletes.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "repo",
            "writes"
          ],
          "properties": {
            "repo": {
              "type": "string",
              "format": "at-identifier",
              "description": "The handle or DID of the repo."
            },
            "validate": {
              "type": "boolean",
              "default": true,
              "description": "Validate the records?"
            },
            "writes": {
              "type": "array",
              "items": {
                "type": "union",
                "refs": [
                  "#create",
                  "#update",
                  "#delete"
                ],
                "closed": true
              }
            },
            "swapCommit": {
              "type": "string",
              "format": "cid"
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidSwap"
        }
      ]
    },
    "create": {
      "type": "object",
      "description": "Create a new record.",
      "required": [
        "action",
        "collection",
        "value"
      ],
      "properties": {
        "collection": {
          "type": "string",
          "format": "nsid"
        },
        "rkey": {
          "type": "string"
        },
        "value": {
          "type": "unknown"
        }
      }
    },
    "update": {
      "type": "object",
      "description": "Update an existing record.",
      "required": [
        "action",
        "collection",
        "rkey",
        "value"
      ],
      "properties": {
        "collection": {
          "type": "string",
          "format": "nsid"
        },
        "rkey": {
          "type": "string"
        },
        "value": {
          "type": "unknown"
        }
      }
    },
    "delete": {
      "type": "object",
      "description": "Delete an existing record.",
      "required": [
        "action",
        "collection",
        "rkey"
      ],
      "properties": {
        "collection": {
          "type": "string",
          "format": "nsid"
        },
        "rkey": {
          "type": "string"
        }
      }
    }
  }
}
```
---

## com.atproto.repo.createRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.createRecord",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create a new record.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "repo",
            "collection",
            "record"
          ],
          "properties": {
            "repo": {
              "type": "string",
              "format": "at-identifier",
              "description": "The handle or DID of the repo."
            },
            "collection": {
              "type": "string",
              "format": "nsid",
              "description": "The NSID of the record collection."
            },
            "rkey": {
              "type": "string",
              "description": "The key of the record."
            },
            "validate": {
              "type": "boolean",
              "default": true,
              "description": "Validate the record?"
            },
            "record": {
              "type": "unknown",
              "description": "The record to create."
            },
            "swapCommit": {
              "type": "string",
              "format": "cid",
              "description": "Compare and swap with the previous commit by cid."
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
            "cid"
          ],
          "properties": {
            "uri": {
              "type": "string",
              "format": "at-uri"
            },
            "cid": {
              "type": "string",
              "format": "cid"
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidSwap"
        }
      ]
    }
  }
}
```
---

## com.atproto.repo.deleteRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.deleteRecord",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Delete a record, or ensure it doesn't exist.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "repo",
            "collection",
            "rkey"
          ],
          "properties": {
            "repo": {
              "type": "string",
              "format": "at-identifier",
              "description": "The handle or DID of the repo."
            },
            "collection": {
              "type": "string",
              "format": "nsid",
              "description": "The NSID of the record collection."
            },
            "rkey": {
              "type": "string",
              "description": "The key of the record."
            },
            "swapRecord": {
              "type": "string",
              "format": "cid",
              "description": "Compare and swap with the previous record by cid."
            },
            "swapCommit": {
              "type": "string",
              "format": "cid",
              "description": "Compare and swap with the previous commit by cid."
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidSwap"
        }
      ]
    }
  }
}
```
---

## com.atproto.repo.describeRepo

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.describeRepo",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get information about the repo, including the list of collections.",
      "parameters": {
        "type": "params",
        "required": [
          "repo"
        ],
        "properties": {
          "repo": {
            "type": "string",
            "format": "at-identifier",
            "description": "The handle or DID of the repo."
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
            "didDoc",
            "collections",
            "handleIsCorrect"
          ],
          "properties": {
            "handle": {
              "type": "string",
              "format": "handle"
            },
            "did": {
              "type": "string",
              "format": "did"
            },
            "didDoc": {
              "type": "unknown"
            },
            "collections": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "nsid"
              }
            },
            "handleIsCorrect": {
              "type": "boolean"
            }
          }
        }
      }
    }
  }
}
```
---

## com.atproto.repo.getRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.getRecord",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get a record.",
      "parameters": {
        "type": "params",
        "required": [
          "repo",
          "collection",
          "rkey"
        ],
        "properties": {
          "repo": {
            "type": "string",
            "format": "at-identifier",
            "description": "The handle or DID of the repo."
          },
          "collection": {
            "type": "string",
            "format": "nsid",
            "description": "The NSID of the record collection."
          },
          "rkey": {
            "type": "string",
            "description": "The key of the record."
          },
          "cid": {
            "type": "string",
            "format": "cid",
            "description": "The CID of the version of the record. If not specified, then return the most recent version."
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "uri",
            "value"
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
            "value": {
              "type": "unknown"
            }
          }
        }
      }
    }
  }
}
```
---

## com.atproto.repo.listRecords

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.listRecords",
  "defs": {
    "main": {
      "type": "query",
      "description": "List a range of records in a collection.",
      "parameters": {
        "type": "params",
        "required": [
          "repo",
          "collection"
        ],
        "properties": {
          "repo": {
            "type": "string",
            "format": "at-identifier",
            "description": "The handle or DID of the repo."
          },
          "collection": {
            "type": "string",
            "format": "nsid",
            "description": "The NSID of the record type."
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 50,
            "description": "The number of records to return."
          },
          "cursor": {
            "type": "string"
          },
          "rkeyStart": {
            "type": "string",
            "description": "DEPRECATED: The lowest sort-ordered rkey to start from (exclusive)"
          },
          "rkeyEnd": {
            "type": "string",
            "description": "DEPRECATED: The highest sort-ordered rkey to stop at (exclusive)"
          },
          "reverse": {
            "type": "boolean",
            "description": "Reverse the order of the returned records?"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "records"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "records": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#record"
              }
            }
          }
        }
      }
    },
    "record": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "value"
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
        "value": {
          "type": "unknown"
        }
      }
    }
  }
}
```
---

## com.atproto.repo.putRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.putRecord",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Write a record, creating or updating it as needed.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "repo",
            "collection",
            "rkey",
            "record"
          ],
          "nullable": [
            "swapRecord"
          ],
          "properties": {
            "repo": {
              "type": "string",
              "format": "at-identifier",
              "description": "The handle or DID of the repo."
            },
            "collection": {
              "type": "string",
              "format": "nsid",
              "description": "The NSID of the record collection."
            },
            "rkey": {
              "type": "string",
              "description": "The key of the record."
            },
            "validate": {
              "type": "boolean",
              "default": true,
              "description": "Validate the record?"
            },
            "record": {
              "type": "unknown",
              "description": "The record to write."
            },
            "swapRecord": {
              "type": "string",
              "format": "cid",
              "description": "Compare and swap with the previous record by cid."
            },
            "swapCommit": {
              "type": "string",
              "format": "cid",
              "description": "Compare and swap with the previous commit by cid."
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
            "cid"
          ],
          "properties": {
            "uri": {
              "type": "string",
              "format": "at-uri"
            },
            "cid": {
              "type": "string",
              "format": "cid"
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidSwap"
        }
      ]
    }
  }
}
```
---

## com.atproto.repo.strongRef

A URI with a content-hash fingerprint.

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.strongRef",
  "description": "A URI with a content-hash fingerprint.",
  "defs": {
    "main": {
      "type": "object",
      "required": [
        "uri",
        "cid"
      ],
      "properties": {
        "uri": {
          "type": "string",
          "format": "at-uri"
        },
        "cid": {
          "type": "string",
          "format": "cid"
        }
      }
    }
  }
}
```
---

## com.atproto.repo.uploadBlob

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.uploadBlob",
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
            "blob"
          ],
          "properties": {
            "blob": {
              "type": "blob"
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->