---
title: com.atproto.server
summary: ATP Lexicon - Server Schemas
---

# com.atproto.server Lexicon

Definitions related to server behaviors in ATP.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.server.createAccount

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.createAccount",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an account.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "handle",
            "email",
            "password"
          ],
          "properties": {
            "email": {
              "type": "string"
            },
            "handle": {
              "type": "string",
              "format": "handle"
            },
            "inviteCode": {
              "type": "string"
            },
            "password": {
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
            "accessJwt",
            "refreshJwt",
            "handle",
            "did"
          ],
          "properties": {
            "accessJwt": {
              "type": "string"
            },
            "refreshJwt": {
              "type": "string"
            },
            "handle": {
              "type": "string",
              "format": "handle"
            },
            "did": {
              "type": "string",
              "format": "did"
            }
          }
        }
      },
      "errors": [
        {
          "name": "InvalidHandle"
        },
        {
          "name": "InvalidPassword"
        },
        {
          "name": "InvalidInviteCode"
        },
        {
          "name": "HandleNotAvailable"
        },
        {
          "name": "UnsupportedDomain"
        }
      ]
    }
  }
}
```
---

## com.atproto.server.createAppPassword

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.createAppPassword",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an app-specific password.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "name"
          ],
          "properties": {
            "name": {
              "type": "string"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "ref",
          "ref": "#appPassword"
        }
      },
      "errors": [
        {
          "name": "AccountTakedown"
        }
      ]
    },
    "appPassword": {
      "type": "object",
      "required": [
        "name",
        "password",
        "createdAt"
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "password": {
          "type": "string"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        }
      }
    }
  }
}
```
---

## com.atproto.server.createInviteCode

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.createInviteCode",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an invite code.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "useCount"
          ],
          "properties": {
            "useCount": {
              "type": "integer"
            },
            "forAccount": {
              "type": "string",
              "format": "did"
            }
          }
        }
      },
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "code"
          ],
          "properties": {
            "code": {
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

## com.atproto.server.createInviteCodes

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.createInviteCodes",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an invite code.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "codeCount",
            "useCount"
          ],
          "properties": {
            "codeCount": {
              "type": "integer",
              "default": 1
            },
            "useCount": {
              "type": "integer"
            },
            "forAccounts": {
              "type": "array",
              "items": {
                "type": "string",
                "format": "did"
              }
            }
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
            "codes": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#accountCodes"
              }
            }
          }
        }
      }
    },
    "accountCodes": {
      "type": "object",
      "required": [
        "account",
        "codes"
      ],
      "properties": {
        "account": {
          "type": "string"
        },
        "codes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  }
}
```
---

## com.atproto.server.createSession

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.createSession",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an authentication session.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "identifier",
            "password"
          ],
          "properties": {
            "identifier": {
              "type": "string",
              "description": "Handle or other identifier supported by the server for the authenticating user."
            },
            "password": {
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
            "accessJwt",
            "refreshJwt",
            "handle",
            "did"
          ],
          "properties": {
            "accessJwt": {
              "type": "string"
            },
            "refreshJwt": {
              "type": "string"
            },
            "handle": {
              "type": "string",
              "format": "handle"
            },
            "did": {
              "type": "string",
              "format": "did"
            },
            "email": {
              "type": "string"
            }
          }
        }
      },
      "errors": [
        {
          "name": "AccountTakedown"
        }
      ]
    }
  }
}
```
---

## com.atproto.server.defs

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.defs",
  "defs": {
    "inviteCode": {
      "type": "object",
      "required": [
        "code",
        "available",
        "disabled",
        "forAccount",
        "createdBy",
        "createdAt",
        "uses"
      ],
      "properties": {
        "code": {
          "type": "string"
        },
        "available": {
          "type": "integer"
        },
        "disabled": {
          "type": "boolean"
        },
        "forAccount": {
          "type": "string"
        },
        "createdBy": {
          "type": "string"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        },
        "uses": {
          "type": "array",
          "items": {
            "type": "ref",
            "ref": "#inviteCodeUse"
          }
        }
      }
    },
    "inviteCodeUse": {
      "type": "object",
      "required": [
        "usedBy",
        "usedAt"
      ],
      "properties": {
        "usedBy": {
          "type": "string",
          "format": "did"
        },
        "usedAt": {
          "type": "string",
          "format": "datetime"
        }
      }
    }
  }
}
```
---

## com.atproto.server.deleteAccount

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.deleteAccount",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Delete a user account with a token and password.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "did",
            "password",
            "token"
          ],
          "properties": {
            "did": {
              "type": "string",
              "format": "did"
            },
            "password": {
              "type": "string"
            },
            "token": {
              "type": "string"
            }
          }
        }
      },
      "errors": [
        {
          "name": "ExpiredToken"
        },
        {
          "name": "InvalidToken"
        }
      ]
    }
  }
}
```
---

## com.atproto.server.deleteSession

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.deleteSession",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Delete the current session."
    }
  }
}
```
---

## com.atproto.server.describeServer

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.describeServer",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get a document describing the service's accounts configuration.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "availableUserDomains"
          ],
          "properties": {
            "inviteCodeRequired": {
              "type": "boolean"
            },
            "availableUserDomains": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "links": {
              "type": "ref",
              "ref": "#links"
            }
          }
        }
      }
    },
    "links": {
      "type": "object",
      "properties": {
        "privacyPolicy": {
          "type": "string"
        },
        "termsOfService": {
          "type": "string"
        }
      }
    }
  }
}
```
---

## com.atproto.server.getAccountInviteCodes

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.getAccountInviteCodes",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get all invite codes for a given account",
      "parameters": {
        "type": "params",
        "properties": {
          "includeUsed": {
            "type": "boolean",
            "default": true
          },
          "createAvailable": {
            "type": "boolean",
            "default": true
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
            "codes": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "com.atproto.server.defs#inviteCode"
              }
            }
          }
        }
      },
      "errors": [
        {
          "name": "DuplicateCreate"
        }
      ]
    }
  }
}
```
---

## com.atproto.server.getSession

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.getSession",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get information about the current session.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "handle",
            "did"
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

## com.atproto.server.listAppPasswords

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.listAppPasswords",
  "defs": {
    "main": {
      "type": "query",
      "description": "List all app-specific passwords.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "passwords"
          ],
          "properties": {
            "passwords": {
              "type": "array",
              "items": {
                "type": "ref",
                "ref": "#appPassword"
              }
            }
          }
        }
      },
      "errors": [
        {
          "name": "AccountTakedown"
        }
      ]
    },
    "appPassword": {
      "type": "object",
      "required": [
        "name",
        "createdAt"
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "createdAt": {
          "type": "string",
          "format": "datetime"
        }
      }
    }
  }
}
```
---

## com.atproto.server.refreshSession

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.refreshSession",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Refresh an authentication session.",
      "output": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "accessJwt",
            "refreshJwt",
            "handle",
            "did"
          ],
          "properties": {
            "accessJwt": {
              "type": "string"
            },
            "refreshJwt": {
              "type": "string"
            },
            "handle": {
              "type": "string",
              "format": "handle"
            },
            "did": {
              "type": "string",
              "format": "did"
            }
          }
        }
      },
      "errors": [
        {
          "name": "AccountTakedown"
        }
      ]
    }
  }
}
```
---

## com.atproto.server.requestAccountDelete

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.requestAccountDelete",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Initiate a user account deletion via email."
    }
  }
}
```
---

## com.atproto.server.requestPasswordReset

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.requestPasswordReset",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Initiate a user account password reset via email.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "email"
          ],
          "properties": {
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

## com.atproto.server.resetPassword

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.resetPassword",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Reset a user account password using a token.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "token",
            "password"
          ],
          "properties": {
            "token": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          }
        }
      },
      "errors": [
        {
          "name": "ExpiredToken"
        },
        {
          "name": "InvalidToken"
        }
      ]
    }
  }
}
```
---

## com.atproto.server.revokeAppPassword

```json
{
  "lexicon": 1,
  "id": "com.atproto.server.revokeAppPassword",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Revoke an app-specific password by name.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": [
            "name"
          ],
          "properties": {
            "name": {
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