---
title: Lexicon
summary: A schemas format and distribution network.
---

# Lexicon

Lexicon is a schemas document format used to define [XRPC](./xrpc) methods and repository record types. Every Lexicon schema is written in JSON and follows the interface specified below. The schemas are identified using [NSIDs](./nsid) which are then used to identify the methods or record types they describe.

## Lexicon URIs

```
alpha     = "a" / "b" / "c" / "d" / "e" / "f" / "g" / "h" / "i" / "j" / "k" / "l" / "m" / "n" / "o" / "p" / "q" / "r" / "s" / "t" / "u" / "v" / "w" / "x" / "y" / "z" / "A" / "B" / "C" / "D" / "E" / "F" / "G" / "H" / "I" / "J" / "K" / "L" / "M" / "N" / "O" / "P" / "Q" / "R" / "S" / "T" / "U" / "V" / "W" / "X" / "Y" / "Z"
number    = "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9" / "0"
def-id    = alpha *( alpha / number )
uri       = 'lex:' nsid ['#' def-id]
```

`nsid` is defined in the [NSID spec](/specs/nsid).

The `def-id` maps to the keys of the `defs` subobject within a document. If no `def-id` is specified, the `main` definition is referenced.

## Interface

```typescript
// core
// =

type LexRef = string

interface LexiconDoc {
  lexicon: 1
  id: string // an NSID
  revision?: number
  description?: string
  defs: Record<string, LexUserType|LexArray|LexPrimitive|LexRef[]>
}

interface LexUserType {
  type: 'query'
    | 'procedure'
    | 'record'
    | 'token'
    | 'object'
    | 'blob'
    | 'image'
    | 'video'
    | 'audio'
  description?: string
}

interface LexToken extends LexUserType {
  type = 'token'
}

interface LexObject extends LexUserType {
  type = 'object'
  required?: string[]
  properties: Record<string, LexRef | LexArray | LexPrimitive | LexRef[]>
}

// database
// =

interface LexRecord extends LexUserType {
  type = 'record'
  key?: string
  record: LexObject
}

// XRPC
// =

interface LexXrpcQuery extends LexUserType {
  type = 'query'
  parameters?: Record<string, LexPrimitive>
  output?: LexXrpcBody
  errors?: LexXrpcError[]
}

interface LexXrpcProcedure extends LexUserType {
  type = 'procedure'
  parameters?: Record<string, LexPrimitive>
  input?: LexXrpcBody
  output?: LexXrpcBody
  errors?: LexXrpcError[]
}

interface LexXrpcBody {
  description?: string
  encoding: string|string[]
  schema: LexObject
}

interface LexXrpcError {
  name: string
  description?: string
}

// blobs
// =

interface LexBlob extends LexUserType {
  type = 'blob'
  accept?: string[]
  maxSize?: number
}

interface LexImage extends LexUserType {
  type = 'image'
  accept?: string[]
  maxSize?: number
  maxWidth?: number
  maxHeight?: number
}

interface LexVideo extends LexUserType {
  type = 'video'
  accept?: string[]
  maxSize?: number
  maxWidth?: number
  maxHeight?: number
  maxLength?: number
}

interface LexAudio extends LexUserType {
  type = 'audio'
  accept?: string[]
  maxSize?: number
  maxLength?: number
}

// primitives
// =

interface LexArray {
  type = 'array'
  description?: string
  items: LexRef | LexPrimitive | LexRef[]
  minLength?: number
  maxLength?: number
}

interface LexPrimitive {
  type: 'boolean' | 'number' | 'integer' | 'string'
  description?: string
}

interface LexBoolean extends LexPrimitive {
  type = 'boolean'
  default?: boolean
  const?: boolean
}

interface LexNumber extends LexPrimitive {
  type = 'number'
  default?: number
  minimum?: number
  maximum?: number
  enum?: number[]
  const?: number
}

interface LexInteger extends LexPrimitive {
  type = 'integer'
  default?: number
  minimum?: number
  maximum?: number
  enum?: number[]
  const?: number
}

interface LexString extends LexPrimitive {
  type = 'string'
  default?: string
  minLength?: number
  maxLength?: number
  enum?: string[]
  const?: string
  knownValues?: string[]
}
```

## Examples

### XRPC Method

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
        "schema": "#inputSchema"
      },
      "output": {
        "encoding": "application/json",
        "schema": "#outputSchema"
      },
      "errors": [
        {"name": "InvalidHandle"},
        {"name": "InvalidPassword"},
        {"name": "InvalidInviteCode"},
        {"name": "HandleNotAvailable"}
      ]
    },
    "inputSchema": {
      "type": "object",
      "required": ["handle", "email", "password"],
      "properties": {
        "email": {"type": "string"},
        "handle": {"type": "string"},
        "inviteCode": {"type": "string"},
        "password": {"type": "string"},
        "recoveryKey": {"type": "string"}
      }
    },
    "outputSchema": {
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
  }
}

```

### ATP Record Type

```json
{
  "lexicon": 1,
  "id": "app.bsky.feed.post",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["text", "createdAt"],
        "properties": {
          "text": {"type": "string", "maxLength": 256},
          "entities": {"type": "array", "items": "#entity"},
          "reply": "#reply",
          "createdAt": {"type": "string"}
        }
      }
    },
    "reply": {
      "type": "object",
      "required": ["root", "parent"],
      "properties": {
        "root": "#postRef",
        "parent": "#postRef"
      }
    },
    "postRef": {
      "type": "object",
      "required": ["uri", "cid"],
      "properties": {
        "uri": {"type": "string"},
        "cid": {"type": "string"}
      }
    },
    "entity": {
      "type": "object",
      "required": ["index", "type", "value"],
      "properties": {
        "index": "#textSlice",
        "type": {
          "type": "string",
          "description": "Expected values are 'mention', 'hashtag', and 'link'."
        },
        "value": {"type": "string"}
      }
    },
    "textSlice": {
      "type": "object",
      "required": ["start", "end"],
      "properties": {
        "start": {"type": "integer", "minimum": 0},
        "end": {"type": "integer", "minimum": 0}
      }
    }
  }
}
```

### Token

```json
{
  "lexicon": 1,
  "id": "com.socialapp.actorUser",
  "def": {
    "main": {
      "type": "token",
      "description": "Actor type of 'User'"
    }
  }
}
```
