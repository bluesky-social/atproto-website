---
title: Lexicon
summary: A schema-driven interoperability framework
tldr:
 - Lexicon is a global schema system
 - It uses reverse-DNS names like "com.example.ping()"
 - The definitions are mainly JSON-Schema documents
 - It's currently used for RPC methods and repo records
---

# Intro to Lexicon

Lexicon is a schema system used to define RPC methods and record types. Every Lexicon schema is written in JSON and uses [JSON-Schema](https://json-schema.org/) to define constraints.

The schemas are identified using [NSIDs](/specs/nsid) which are a reverse-DNS format. Here are some example methods:

```typescript
com.atproto.repo.getRecord()
com.atproto.handle.resolve()
app.bsky.feed.getPostThread()
app.bsky.notification.list()
```

And here are some example record types:

```typescript
app.bsky.fed.post
app.bsky.feed.like
app.bsky.actor.profile
app.bsky.graph.follow
```

## Why is Lexicon needed?

Interoperability. An open network like ATP needs a way to agree on behaviors and semantics. Lexicon solves this while making it relatively simple for developers to introduce new schemas.

Lexicon is not RDF. While RDF is effective at describing data, it is not ideal for enforcing schemas. Lexicon is easier to use because it doesn't need the generality that RDF provides. In fact, Lexicon's schemas enable code-generation with types and validation, which makes life much easier!

## Schema format

Schemas are JSON objects which follow this Typescript interface:

```typescript
interface LexiconDoc {
  lexicon: 1
  id: string // an NSID
  type: 'query' | 'procedure' | 'record' | 'token'
  revision?: number
  description?: string
  defs?: JSONSchema

  // if type == record
  key?: string
  record?: JSONSchema

  // if type == query or procedure
  parameters?: Record<string, XrpcParameter>
  input?: XrpcBody
  output?: XrpcBody
  errors?: XrpcError[]
}
```

Notice the structure differs depending on the `type`. The meanings of the type are:

|Type|Meaning|
|-|-|
|`query`|An XRPC "read" method (aka GET).|
|`procedure`|An XRPC "modify" method (aka POST).|
|`record`|An ATP repository record type.|
|`token`|A declared identifier with no behaviors associated.|

## RPC methods

AT Protocol's RPC system, [XRPC](/specs/xrpc), is essentially a thin wrapper around HTTPS. Its purpose is to apply the Lexicon to HTTPS. A call to:

```typescript
com.example.getProfile()
```

is actually just an HTTP request:

```text
GET /xrpc/com.example.getProfile
```

The schemas establish valid query parameters, request bodies, and response bodies.

```json
{
  "lexicon": 1,
  "id": "com.example.getProfile",
  "type": "query",
  "parameters": {
    "user": {"type": "string", "required": true}
  },
  "output": {
    "encoding": "application/json",
    "schema": {
      "type": "object",
      "required": ["did", "name"],
      "properties": {
        "did": {"type": "string"},
        "name": {"type": "string"},
        "displayName": {"type": "string", "maxLength": 64},
        "description": {"type": "string", "maxLength": 256}
      }
    }
  }
}
```

With code-generation, these schemas become very easy to use:

```typescript
await client.com.example.getProfile({user: 'bob.com'})
// => {name: 'bob.com', did: 'did:plc:1234', displayName: '...', ...}
```

## Record types

Schemas define the possible values of a record. Every record has a "type" which maps to a schema and also establishes the URL of a record.

For instance, this "follow" record:

```json
{
  "$type": "com.example.follow",
  "subject": "at://did:plc:12345",
  "createdAt": "2022-10-09T17:51:55.043Z"
}
```

...would have a URL like:

```text
at://bob.com/com.example.follow/1234
```

...and a schema like:

```json
{
  "lexicon": 1,
  "id": "com.example.follow",
  "type": "record",
  "description": "A social follow",
  "record": {
    "type": "object",
    "required": ["subject", "createdAt"],
    "properties": {
      "subject": { "type": "string" },
      "createdAt": {"type": "string", "format": "date-time"}
    }
  }
}
```

## Tokens

Tokens declare global identifiers which can be used in data.

Let's say a record schema wanted to specify three possible states for a traffic light: 'red', 'yellow', and 'green'.

```json
{
  "lexicon": 1,
  "id": "com.example.trafficLight",
  "type": "record",
  "record": {
    "type": "object",
    "required": ["state"],
    "properties": {
      "state": { "type": "string", "enum": ["red", "yellow", "green"] },
    }
  }
}
```

This is perfectly acceptable, but it's not extensible. You could never add new states, like "flashing yellow" or "purple" (who knows, it could happen).

To add flexibility, you could remove the enum constraint and just document the possible values:

```json
{
  "lexicon": 1,
  "id": "com.example.trafficLight",
  "type": "record",
  "record": {
    "type": "object",
    "required": ["state"],
    "properties": {
      "state": {
        "type": "string",
        "description": "Suggested values: red, yellow, green"
      },
    }
  }
}
```

This isn't bad, but it lacks specificity. People inventing new values for state are likely to collide with each other, and there won't be clear documentation on each state.

Instead, you can define Lexicon tokens for the values you use:

```json
{
  "lexicon": 1,
  "id": "com.example.green",
  "type": "token",
  "description": "A possible traffic light state.",
}
{
  "lexicon": 1,
  "id": "com.example.yellow",
  "type": "token",
  "description": "A possible traffic light state.",
}
{
  "lexicon": 1,
  "id": "com.example.red",
  "type": "token",
  "description": "A possible traffic light state.",
}
```

This gives us unambiguous values to use in our trafficLight state. The final schema will still use flexible validation, but other teams will have more clarity on where the values originate from and how to add their own:

```json
{
  "lexicon": 1,
  "id": "com.example.trafficLight",
  "type": "record",
  "record": {
    "type": "object",
    "required": ["state"],
    "properties": {
      "state": {
        "type": "string",
        "description": "Suggested values: com.example.red, com.example.yellow, com.example.green"
      },
    }
  }
}
```

## Extensibility

Records may introduce additional schemas using the `#/$ext` field. This is a standard field which encodes a map of schema NSIDs to "extension objects."

Extension objects use two standard fields: `$required` and `$fallback`. The `$required` field tells us if the extension *must* be understood by the software to use it properly. Meanwhile the `$fallback` field gives us a string instructing the software how to tell the user what's wrong.

Here is an example of a record with an optional extension:

```json
{
  "$type": "com.example.post",
  "text": "Hello, world!",
  "createdAt": "2022-09-15T16:37:17.131Z",
  "$ext": {
    "com.example.poll": {
      "$required": false,
      "$fallback": "This post includes a poll which your app can't render.",
      "question": "How are you today?",
      "options": ["Good", "Meh", "Bad"]
    }
  }
}
```

## Versioning

Once a schema is published, it can never change its constraints. Loosening a constraint (adding possible values) will cause old software to fail validation for new data, and tightening a constraint (removing possible values) will cause new software to fail validation for old data. As a consequence, schemas may only add optional constraints to previously unconstrained fields.

If a schema must change a previously-published constraint, it should be published as a new schema under a new NSID.

## Schema distribution

Schemas are designed to be machine-readable and network-accessible. While it is not currently _required_ that a schema is available on the network, it is strongly advised to publish schemas so that a single canonical & authoritative representation is available to consumers of the method.

To fetch a schema, a request is sent via the XRPC [`getSchema`](/specs/xrpc#getschema) method. This request is sent to the authority of the NSID.
