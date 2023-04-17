---
title: com.atproto.admin
summary: ATP Lexicon - Admin Schemas
---

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.admin.defs

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.defs",
  "defs": {
    "actionView": {
      "type": "object",
      "required": [
        "id",
        "action",
        "subject",
        "subjectBlobCids",
        "reason",
        "createdBy",
        "createdAt",
        "resolvedReportIds"
      ],
      "properties": {
        "id": {
          "type": "integer"
        },
        "action": {
          "type": "ref",
          "ref": "#actionType"
        },
        "subject": {
          "type": "union",
          "refs": [
            "#repoRef",
            "com.atproto.repo.strongRef"
          ]
        },
        "subjectBlobCids": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "createLabelVals": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "negateLabelVals": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "reason": {
          "type": "string"
        },
        "createdBy": {
          "type": "string",
          "format": "did"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "reversal": {
          "type": "ref",
          "ref": "#actionReversal"
        },
        "resolvedReportIds": {
          "type": "array",
          "items": {
            "type": "integer"
          }
        }
      }
    },
    "actionViewDetail": {
      "type": "object",
      "required": [
        "id",
        "action",
        "subject",
        "subjectBlobs",
        "reason",
        "createdBy",
        "createdAt",
        "resolvedReports"
      ],
      "properties": {
        "id": {
          "type": "integer"
        },
        "action": {
          "type": "ref",
          "ref": "#actionType"
        },
        "subject": {
          "type": "union",
          "refs": [
            "#repoView",
            "#recordView"
          ]
        },
        "subjectBlobs": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#blobView"
          }
        },
        "createLabelVals": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "negateLabelVals": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "reason": {
          "type": "string"
        },
        "createdBy": {
          "type": "string",
          "format": "did"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "reversal": {
          "type": "ref",
          "ref": "#actionReversal"
        },
        "resolvedReports": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#reportView"
          }
        }
      }
    },
    "actionViewCurrent": {
      "type": "object",
      "required": [
        "id",
        "action"
      ],
      "properties": {
        "id": {
          "type": "integer"
        },
        "action": {
          "type": "ref",
          "ref": "#actionType"
        }
      }
    },
    "actionReversal": {
      "type": "object",
      "required": [
        "reason",
        "createdBy",
        "createdAt"
      ],
      "properties": {
        "reason": {
          "type": "string"
        },
        "createdBy": {
          "type": "string",
          "format": "did"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        }
      }
    },
    "actionType": {
      "type": "string",
      "knownValues": [
        "#takedown",
        "#flag",
        "#acknowledge"
      ]
    },
    "takedown": {
      "type": "token",
      "description": "Moderation action type: Takedown. Indicates that content should not be served by the PDS."
    },
    "flag": {
      "type": "token",
      "description": "Moderation action type: Flag. Indicates that the content was reviewed and considered to violate PDS rules, but may still be served."
    },
    "acknowledge": {
      "type": "token",
      "description": "Moderation action type: Acknowledge. Indicates that the content was reviewed and not considered to violate PDS rules."
    },
    "reportView": {
      "type": "object",
      "required": [
        "id",
        "reasonType",
        "subject",
        "reportedBy",
        "createdAt",
        "resolvedByActionIds"
      ],
      "properties": {
        "id": {
          "type": "integer"
        },
        "reasonType": {
          "type": "ref",
          "ref": "com.atproto.moderation.defs#reasonType"
        },
        "reason": {
          "type": "string"
        },
        "subject": {
          "type": "union",
          "refs": [
            "#repoRef",
            "com.atproto.repo.strongRef"
          ]
        },
        "reportedBy": {
          "type": "string",
          "format": "did"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "resolvedByActionIds": {
          "type": "array",
          "items": {
            "type": "integer"
          }
        }
      }
    },
    "reportViewDetail": {
      "type": "object",
      "required": [
        "id",
        "reasonType",
        "subject",
        "reportedBy",
        "createdAt",
        "resolvedByActions"
      ],
      "properties": {
        "id": {
          "type": "integer"
        },
        "reasonType": {
          "type": "ref",
          "ref": "com.atproto.moderation.defs#reasonType"
        },
        "reason": {
          "type": "string"
        },
        "subject": {
          "type": "union",
          "refs": [
            "#repoView",
            "#recordView"
          ]
        },
        "reportedBy": {
          "type": "string",
          "format": "did"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "resolvedByActions": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.admin.defs#actionView"
          }
        }
      }
    },
    "repoView": {
      "type": "object",
      "required": [
        "did",
        "handle",
        "relatedRecords",
        "indexedAt",
        "moderation"
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
        "email": {
          "type": "string"
        },
        "relatedRecords": {
          "type": "array",
          "items": {
            "type": "unknown"
          }
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "moderation": {
          "type": "ref",
          "ref": "#moderation"
        },
        "invitedBy": {
          "type": "ref",
          "ref": "com.atproto.server.defs#inviteCode"
        }
      }
    },
    "repoViewDetail": {
      "type": "object",
      "required": [
        "did",
        "handle",
        "relatedRecords",
        "indexedAt",
        "moderation"
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
        "email": {
          "type": "string"
        },
        "relatedRecords": {
          "type": "array",
          "items": {
            "type": "unknown"
          }
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "moderation": {
          "type": "ref",
          "ref": "#moderationDetail"
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.label.defs#label"
          }
        },
        "invitedBy": {
          "type": "ref",
          "ref": "com.atproto.server.defs#inviteCode"
        },
        "invites": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.server.defs#inviteCode"
          }
        }
      }
    },
    "repoRef": {
      "type": "object",
      "required": [
        "did"
      ],
      "properties": {
        "did": {
          "type": "string",
          "format": "did"
        }
      }
    },
    "recordView": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "value",
        "blobCids",
        "indexedAt",
        "moderation",
        "repo"
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
        },
        "blobCids": {
          "type": "array",
          "items": {
            "type": "string",
            "format": "cid"
          }
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "moderation": {
          "type": "ref",
          "ref": "#moderation"
        },
        "repo": {
          "type": "ref",
          "ref": "#repoView"
        }
      }
    },
    "recordViewDetail": {
      "type": "object",
      "required": [
        "uri",
        "cid",
        "value",
        "blobs",
        "indexedAt",
        "moderation",
        "repo"
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
        },
        "blobs": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#blobView"
          }
        },
        "labels": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "com.atproto.label.defs#label"
          }
        },
        "indexedAt": {
          "type": "string",
          "format": "datetime"
        },
        "moderation": {
          "type": "ref",
          "ref": "#moderationDetail"
        },
        "repo": {
          "type": "ref",
          "ref": "#repoView"
        }
      }
    },
    "moderation": {
      "type": "object",
      "required": [],
      "properties": {
        "currentAction": {
          "type": "ref",
          "ref": "#actionViewCurrent"
        }
      }
    },
    "moderationDetail": {
      "type": "object",
      "required": [
        "actions",
        "reports"
      ],
      "properties": {
        "currentAction": {
          "type": "ref",
          "ref": "#actionViewCurrent"
        },
        "actions": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#actionView"
          }
        },
        "reports": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#reportView"
          }
        }
      }
    },
    "blobView": {
      "type": "object",
      "required": [
        "cid",
        "mimeType",
        "size",
        "createdAt"
      ],
      "properties": {
        "cid": {
          "type": "string",
          "format": "cid"
        },
        "mimeType": {
          "type": "string"
        },
        "size": {
          "type": "integer"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "details": {
          "type": "union",
          "refs": [
            "#imageDetails",
            "#videoDetails"
          ]
        },
        "moderation": {
          "type": "ref",
          "ref": "#moderation"
        }
      }
    },
    "imageDetails": {
      "type": "object",
      "required": [
        "width",
        "height"
      ],
      "properties": {
        "width": {
          "type": "integer"
        },
        "height": {
          "type": "integer"
        }
      }
    },
    "videoDetails": {
      "type": "object",
      "required": [
        "width",
        "height",
        "length"
      ],
      "properties": {
        "width": {
          "type": "integer"
        },
        "height": {
          "type": "integer"
        },
        "length": {
          "type": "integer"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.disableInviteCodes

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.disableInviteCodes",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Disable some set of codes and/or all codes associated with a set of users",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "properties": {
            "codes": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "accounts": {
              "type": "array",
              "items": {
                "type": "string"
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

## com.atproto.admin.getInviteCodes

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getInviteCodes",
  "defs": {
    "main": {
      "type": "query",
      "description": "Admin view of invite codes",
      "parameters": {
        "type": "params",
        "properties": {
          "sort": {
            "type": "string",
            "knownValues": [
              "recent",
              "usage"
            ],
            "default": "recent"
          },
          "limit": {
            "type": "integer",
            "minimum": 1,
            "maximum": 500,
            "default": 100
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
            "codes"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "codes": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "com.atproto.server.defs#inviteCode"
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

## com.atproto.admin.getModerationAction

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getModerationAction",
  "defs": {
    "main": {
      "type": "query",
      "description": "View details about a moderation action.",
      "parameters": {
        "type": "params",
        "required": [
          "id"
        ],
        "properties": {
          "id": {
            "type": "integer"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#actionViewDetail"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.getModerationActions

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getModerationActions",
  "defs": {
    "main": {
      "type": "query",
      "description": "List moderation actions related to a subject.",
      "parameters": {
        "type": "params",
        "properties": {
          "subject": {
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
            "actions"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "actions": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "com.atproto.admin.defs#actionView"
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

## com.atproto.admin.getModerationReport

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getModerationReport",
  "defs": {
    "main": {
      "type": "query",
      "description": "View details about a moderation report.",
      "parameters": {
        "type": "params",
        "required": [
          "id"
        ],
        "properties": {
          "id": {
            "type": "integer"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#reportViewDetail"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.getModerationReports

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getModerationReports",
  "defs": {
    "main": {
      "type": "query",
      "description": "List moderation reports related to a subject.",
      "parameters": {
        "type": "params",
        "properties": {
          "subject": {
            "type": "string"
          },
          "resolved": {
            "type": "boolean"
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
            "reports"
          ],
          "properties": {
            "cursor": {
              "type": "string"
            },
            "reports": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "com.atproto.admin.defs#reportView"
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

## com.atproto.admin.getRecord

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getRecord",
  "defs": {
    "main": {
      "type": "query",
      "description": "View details about a record.",
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
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#recordViewDetail"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.getRepo

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.getRepo",
  "defs": {
    "main": {
      "type": "query",
      "description": "View details about a repository.",
      "parameters": {
        "type": "params",
        "required": [
          "did"
        ],
        "properties": {
          "did": {
            "type": "string",
            "format": "did"
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#repoViewDetail"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.resolveModerationReports

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.resolveModerationReports",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Resolve moderation reports by an action.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "actionId",
            "reportIds",
            "createdBy"
          ],
          "properties": {
            "actionId": {
              "type": "integer"
            },
            "reportIds": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            },
            "createdBy": {
              "type": "string",
              "format": "did"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#actionView"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.reverseModerationAction

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.reverseModerationAction",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Reverse a moderation action.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "id",
            "reason",
            "createdBy"
          ],
          "properties": {
            "id": {
              "type": "integer"
            },
            "reason": {
              "type": "string"
            },
            "createdBy": {
              "type": "string",
              "format": "did"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#actionView"
        }
      }
    }
  }
}
```
---

## com.atproto.admin.searchRepos

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.searchRepos",
  "defs": {
    "main": {
      "type": "query",
      "description": "Find repositories based on a search term.",
      "parameters": {
        "type": "params",
        "properties": {
          "term": {
            "type": "string"
          },
          "invitedBy": {
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
                "ref": "com.atproto.admin.defs#repoView"
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

## com.atproto.admin.takeModerationAction

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.takeModerationAction",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Take a moderation action on a repo.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "action",
            "subject",
            "reason",
            "createdBy"
          ],
          "properties": {
            "action": {
              "type": "string",
              "knownValues": [
                "com.atproto.admin.defs#takedown",
                "com.atproto.admin.defs#flag",
                "com.atproto.admin.defs#acknowledge"
              ]
            },
            "subject": {
              "type": "union",
              "refs": [
                "com.atproto.admin.defs#repoRef",
                "com.atproto.repo.strongRef"
              ]
            },
            "subjectBlobCids": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "cid"
              }
            },
            "createLabelVals": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "negateLabelVals": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "reason": {
              "type": "string"
            },
            "createdBy": {
              "type": "string",
              "format": "did"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "com.atproto.admin.defs#actionView"
        }
      },
      "errors": [
        {
          "name": "SubjectHasAction"
        }
      ]
    }
  }
}
```
---

## com.atproto.admin.updateAccountEmail

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.updateAccountEmail",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Administrative action to update an account's email",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "account",
            "email"
          ],
          "properties": {
            "account": {
              "type": "string",
              "format": "at-identifier",
              "description": "The handle or DID of the repo."
            },
            "email": {
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

## com.atproto.admin.updateAccountHandle

```json
{
  "lexicon": 1,
  "id": "com.atproto.admin.updateAccountHandle",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Administrative action to update an account's handle",
      "input": {
        "encoding": "application/json",
        "schema": {
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
            }
          }
        }
      }
    }
  }
}
```
<!-- END lex generated TOC please keep comment here to allow auto update -->