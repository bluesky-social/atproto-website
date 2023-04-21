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
// primitives
// =

type LexPrimitive =
  | LexBoolean
  | LexInteger
  | LexString
  | LexUnknown

interface LexBoolean {
  type: 'boolean'
  description?: string
  default?: boolean
  const?: boolean
}

interface LexInteger {
  type: 'integer'
  description?: string
  default?: string
  minimum?: number
  maximum?: number
  enum?: number[]
  const?: number
}

type LexStringFormat =
  | 'datetime'
  | 'uri'
  | 'at-uri'
  | 'did'
  | 'handle'
  | 'at-identifier'
  | 'nsid'
  | 'cid'

interface LexString {
  type: 'string'
  format?: LexStringFormat
  description?: string
  default?: string
  minLength?: number
  maxLength?: number
  minGraphemes?: number
  maxGraphemes?: number
  enum?: string[]
  const?: string
  knownValues?: string[]
}

interface LexUnknown {
  type: 'unknown'
  description?: string
}

// ipld types
// =

type LexIpldType = LexBytes | LexCidLink

interface LexBytes {
  type: 'bytes'
  description?: string
  maxLength?: number
  minLength?: number
}

interface LexCidLink {
  type: 'cid-link'
  description?: string
}

// references
// =

type LexRefVariant = LexRef | LexRefUnion

interface LexRef {
  type: 'ref'
  description?: string
  ref: string
}

interface LexRefUnion {
  type: 'union'
  description?: string
  refs: string[]
  closed?: boolean
}
// blobs
// =

interface LexBlob {
  type: 'blob'
  description?: string
  accept?: string[]
  maxSize?: number
}

// complex types
// =

interface LexArray {
  type: 'array'
  description?: string
  items: LexPrimitive | LexIpldType | LexBlob | LexRefVariant
  maxLength?: number
  minLength?: number
}

interface LexPrimitiveArray extends LexArray {
  items: LexPrimitive
}

interface LexToken {
  type: 'token'
  description?: string
}

interface LexObject {
  type: 'object'
  description?: string
  required?: string[]
  nullable?: string[]
  properties?: Record<
    string,
    LexRefVariant | LexIpldType | LexArray | LexBlob | LexPrimitive
  >
}

// xrpc
// =

interface LexXrpcParameters {
  type: 'params'
  description?: string
  required?: string[]
  properties: Record<string, LexPrimitive | LexPrimitiveArray>
}

interface LexXrpcBody {
  description?: string
  encoding: string
  schema?: LexRefVariant | LexObject
}

interface LexXrpcSubscriptionMessage {
  description?: string
  schema?: LexRefVariant | LexObject
}

interface LexXrpcError {
  name: string
  description?: string
}

interface LexXrpcQuery {
  type: 'query'
  description?: string
  parameters?: LexXrpcParameters
  output?: LexXrpcBody
  errors?: LexXrpcError[]
}

interface LexXrpcProcedure {
  type: 'procedure'
  description?: string
  parameters?: LexXrpcParameters
  input?: LexXrpcBody
  output?: LexXrpcBody
  errors?: LexXrpcError[]
}

interface LexXrpcSubscription {
  type: 'subscription'
  description?: string
  parameters?: LexXrpcParameters
  message?: LexXrpcSubscriptionMessage
  infos?: LexXrpcError[]
  errors?: LexXrpcError[]
}

// database
// =

interface LexRecord {
  type: 'record'
  description?: string
  key?: string
  record: LexObject
}

// core
// =

type LexUserType =
  | LexRecord
  | LexXrpcQuery
  | LexXrpcProcedure
  | LexXrpcSubscription
  | LexBlob
  | LexArray
  | LexToken
  | LexObject
  | LexBoolean
  | LexInteger
  | LexString
  | LexBytes
  | LexCidLink
  | LexUnknown

interface LexiconDoc {
  lexicon: 1
  id: string // Must be a valid NSID
  revision?: number
  description?: string
  defs: Record<string, LexUserType>
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
