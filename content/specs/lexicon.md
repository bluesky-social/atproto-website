---
title: Lexicon
summary: A schemas format and distribution network.
---

# Lexicon

Lexicon is a schemas document format used to define [XRPC](./xrpc) methods and repository record types. Every Lexicon schema is written in JSON and follows the interface specified below. The schemas are identified using [NSIDs](./nsid) which are then used to identify the methods or record types they describe.

## Interface

```typescript
interface LexiconDoc {
  lexicon: 1
  id: string // an NSID
  type: 'query' | 'procedure' | 'record' | 'token'
  revision?: number
  description?: string
  defs?: JSONSchema
}

interface RecordLexiconDoc extends LexiconDoc {
  key?: string
  record: JSONSchema
}

interface XrpcLexiconDoc extends LexiconDoc {
  parameters?: Record<string, XrpcParameter>
  input?: XrpcBody
  output?: XrpcBody
  errors?: XrpcError[]
}

interface XrpcParameter {
  type: 'string' | 'number' | 'integer' | 'boolean'
  description?: string
  default?: string | number | boolean
  required?: boolean
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
}

interface XrpcBody {
  encoding: string|string[]
  schema: JSONSchema
  description?: string
}

interface XrpcError {
  name: string
  description?: string
}
```

## Examples

### XRPC Method

```json
{
  "lexicon": 1,
  "id": "com.atproto.account.create",
  "type": "procedure",
  "description": "Create an account.",
  "input": {
    "encoding": "application/json",
    "schema": {
      "type": "object",
      "required": ["handle", "email", "password"],
      "properties": {
        "email": {"type": "string"},
        "handle": {"type": "string"},
        "inviteCode": {"type": "string"},
        "password": {"type": "string"},
        "recoveryKey": {"type": "string"}
      }
    }
  },
  "output": {
    "encoding": "application/json",
    "schema": {
      "type": "object",
      "required": ["accessJwt", "refreshJwt", "handle", "did", "declarationCid"],
      "properties": {
        "accessJwt": { "type": "string" },
        "refreshJwt": { "type": "string" },
        "handle": { "type": "string" },
        "did": { "type": "string" },
        "declarationCid": { "type": "string" }
      }
    }
  },
  "errors": [
    {"name": "InvalidHandle"},
    {"name": "InvalidPassword"},
    {"name": "InvalidInviteCode"},
    {"name": "HandleNotAvailable"}
  ]
}

```

### ATP Record Type

```json
{
  "lexicon": 1,
  "id": "com.socialapp.repost",
  "type": "record",
  "record": {
    "type": "object",
    "required": ["subject", "createdAt"],
    "properties": {
      "subject": {"type": "string"},
      "createdAt": {"type": "string", "format": "date-time"}
    }
  }
}
```

### Token

```json
{
  "lexicon": 1,
  "id": "com.socialapp.actorUser",
  "type": "token",
  "description": "Actor type of 'User'"
}
```