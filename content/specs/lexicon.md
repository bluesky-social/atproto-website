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
  "id": "com.atproto.server.createAccount",
  "defs": {
    "main": {
      "type": "procedure",
      "description": "Create an account.",
      "input": {
        "encoding": "application/json",
        "schema": {
          "type": "object",
          "required": ["handle", "email", "password"],
          "properties": {
            "email": {"type": "string"},
            "handle": {"type": "string", "format": "handle"},
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
          "required": ["accessJwt", "refreshJwt", "handle", "did"],
          "properties": {
            "accessJwt": { "type": "string" },
            "refreshJwt": { "type": "string" },
            "handle": { "type": "string", "format": "handle" },
            "did": { "type": "string", "format": "did" }
          }
        }
      },
      "errors": [
        {"name": "InvalidHandle"},
        {"name": "InvalidPassword"},
        {"name": "InvalidInviteCode"},
        {"name": "HandleNotAvailable"},
        {"name": "UnsupportedDomain"}
      ]
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
          "text": {"type": "string", "maxLength": 3000, "maxGraphemes": 300},
          "entities": {
            "type": "array",
            "description": "Deprecated: replaced by app.bsky.richtext.facet.",
            "items": {"type": "ref", "ref": "#entity"}
          },
          "facets": {
            "type": "array",
            "items": {"type": "ref", "ref": "app.bsky.richtext.facet"}
          },
          "reply": {"type": "ref", "ref": "#replyRef"},
          "embed": {
            "type": "union",
            "refs": [
              "app.bsky.embed.images",
              "app.bsky.embed.external",
              "app.bsky.embed.record",
              "app.bsky.embed.recordWithMedia"
            ]
          },
          "createdAt": {"type": "string", "format": "datetime"}
        }
      }
    },
    "replyRef":{
      "type": "object",
      "required": ["root", "parent"],
      "properties": {
        "root": {"type": "ref", "ref": "com.atproto.repo.strongRef"},
        "parent": {"type": "ref", "ref": "com.atproto.repo.strongRef"}
      }
    },
    "entity": {
      "type": "object",
      "description": "Deprecated: use facets instead.",
      "required": ["index", "type", "value"],
      "properties": {
        "index": {"type": "ref", "ref": "#textSlice"},
        "type": {
          "type": "string",
          "description": "Expected values are 'mention' and 'link'."
        },
        "value": {"type": "string"}
      }
    },
    "textSlice": {
      "type": "object",
      "description": "Deprecated. Use app.bsky.richtext instead -- A text segment. Start is inclusive, end is exclusive. Indices are for utf16-encoded strings.",
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
  "id": "com.atproto.moderation.defs",
  "defs": {
    "reasonType": {
      "type": "string",
      "knownValues": [
        "com.atproto.moderation.defs#reasonSpam",
        "com.atproto.moderation.defs#reasonViolation",
        "com.atproto.moderation.defs#reasonMisleading",
        "com.atproto.moderation.defs#reasonSexual",
        "com.atproto.moderation.defs#reasonRude",
        "com.atproto.moderation.defs#reasonOther"
      ]
    },
    "reasonSpam": {
      "type": "token",
      "description": "Spam: frequent unwanted promotion, replies, mentions"
    },
    "reasonViolation": {
      "type": "token",
      "description": "Direct violation of server rules, laws, terms of service"
    },
    "reasonMisleading": {
      "type": "token",
      "description": "Misleading identity, affiliation, or content"
    },
    "reasonSexual": {
      "type": "token",
      "description": "Unwanted or mis-labeled sexual content"
    },
    "reasonRude": {
      "type": "token",
      "description": "Rude, harassing, explicit, or otherwise unwelcoming behavior"
    },
    "reasonOther": {
      "type": "token",
      "description": "Other: reports not falling under another report category"
    }
  }
}
```
