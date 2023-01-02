---
title: com.atproto.repo
summary: ATP Lexicon - Repo Schemas
---

# com.atproto.repo Lexicon

Definitions related to repositories in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.repo.batchWrite

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.batchWrite",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Apply a batch transaction of creates, puts, and deletes.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "did",
            "writes"
          ],
          "properties": {
            "did": {
              "type": "string",
              "description": "The DID of the repo."
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
            }
          }
        }
      }
    },
    "create": {
      "type": "object",
      "required": [
        "action",
        "collection",
        "value"
      ],
      "properties": {
        "action": {
          "type": "string",
          "const": "create"
        },
        "collection": {
          "type": "string"
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
      "required": [
        "action",
        "collection",
        "rkey",
        "value"
      ],
      "properties": {
        "action": {
          "type": "string",
          "const": "update"
        },
        "collection": {
          "type": "string"
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
      "required": [
        "action",
        "collection",
        "rkey"
      ],
      "properties": {
        "action": {
          "type": "string",
          "const": "delete"
        },
        "collection": {
          "type": "string"
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
            "did",
            "collection",
            "record"
          ],
          "properties": {
            "did": {
              "type": "string",
              "description": "The DID of the repo."
            },
            "collection": {
              "type": "string",
              "description": "The NSID of the record collection."
            },
            "validate": {
              "type": "boolean",
              "default": true,
              "description": "Validate the record?"
            },
            "record": {
              "type": "unknown",
              "description": "The record to create."
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
              "type": "string"
            },
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
---

## com.atproto.repo.deleteRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.deleteRecord",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Delete a record.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "did",
            "collection",
            "rkey"
          ],
          "properties": {
            "did": {
              "type": "string",
              "description": "The DID of the repo."
            },
            "collection": {
              "type": "string",
              "description": "The NSID of the record collection."
            },
            "rkey": {
              "type": "string",
              "description": "The key of the record."
            }
          }
        }
      }
    }
  }
}
```
---

## com.atproto.repo.describe

```json
{
  "lexicon": 1,
  "id": "com.atproto.repo.describe",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get information about the repo, including the list of collections.",
      "parameters": {
        "type": "params",
        "required": [
          "user"
        ],
        "properties": {
          "user": {
            "type": "string",
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
              "type": "string"
            },
            "did": {
              "type": "string"
            },
            "didDoc": {
              "type": "unknown"
            },
            "collections": {
              "type": "array",
              "items": {
                "type": "string"
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
      "description": "Fetch a record.",
      "parameters": {
        "type": "params",
        "required": [
          "user",
          "collection",
          "rkey"
        ],
        "properties": {
          "user": {
            "type": "string",
            "description": "The handle or DID of the repo."
          },
          "collection": {
            "type": "string",
            "description": "The NSID of the collection."
          },
          "rkey": {
            "type": "string",
            "description": "The key of the record."
          },
          "cid": {
            "type": "string",
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
              "type": "string"
            },
            "cid": {
              "type": "string"
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
          "user",
          "collection"
        ],
        "properties": {
          "user": {
            "type": "string",
            "description": "The handle or DID of the repo."
          },
          "collection": {
            "type": "string",
            "description": "The NSID of the record type."
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 50,
            "description": "The number of records to return."
          },
          "before": {
            "type": "string",
            "description": "A TID to filter the range of records returned."
          },
          "after": {
            "type": "string",
            "description": "A TID to filter the range of records returned."
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
          "type": "string"
        },
        "cid": {
          "type": "string"
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
      "description": "Write a record.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "did",
            "collection",
            "rkey",
            "record"
          ],
          "properties": {
            "did": {
              "type": "string",
              "description": "The DID of the repo."
            },
            "collection": {
              "type": "string",
              "description": "The NSID of the record type."
            },
            "rkey": {
              "type": "string",
              "description": "The TID of the record."
            },
            "validate": {
              "type": "boolean",
              "default": true,
              "description": "Validate the record?"
            },
            "record": {
              "type": "unknown",
              "description": "The record to create."
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
              "type": "string"
            },
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
          "type": "string"
        },
        "cid": {
          "type": "string"
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->