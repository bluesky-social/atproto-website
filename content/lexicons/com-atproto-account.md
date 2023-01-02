---
title: com.atproto.account
summary: ATP Lexicon - Account Schemas
---

# com.atproto.account Lexicon

Definitions related to account-management in ATP services.

<!-- START lex generated content. Please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION! INSTEAD RE-RUN lex TO UPDATE -->
---

## com.atproto.account.create

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.create",
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
              "type": "string"
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
              "type": "string"
            },
            "did": {
              "type": "string"
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
        }
      ]
    }
  }
}
```
---

## com.atproto.account.createInviteCode

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.createInviteCode",
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

## com.atproto.account.delete

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.delete",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Delete an account."
    }
  }
}
```
---

## com.atproto.account.get

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.get",
  "defs": {
    "main": {
      "type": "query",
      "description": "Get information about an account."
    }
  }
}
```
---

## com.atproto.account.requestPasswordReset

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.requestPasswordReset",
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

## com.atproto.account.resetPassword

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.resetPassword",
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
<!-- END lex generated TOC please keep comment here to allow auto update -->