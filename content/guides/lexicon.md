---
title: Lexicon
summary: A schema-driven interoperability framework
tldr:
 - Lexicon is a global schema system
 - It uses reverse-DNS names like "com.example.ping()"
 - The definitions are JSON documents, similar to JSON-Schema
 - It's currently used for HTTP endpoints, event streams, and repo records
---

# Intro to Lexicon

Lexicon is a schema system used to define RPC methods and record types. Every Lexicon schema is written in JSON, in a format similar to [JSON-Schema](https://json-schema.org/) for defining constraints.

The schemas are identified using [NSIDs](/specs/nsid) which are a reverse-DNS format. Here are some example methods:

```typescript
com.atproto.repo.getRecord()
com.atproto.identity.resolveHandle()
app.bsky.feed.getPostThread()
app.bsky.notification.listNotifications()
```

And here are some example record types:

```typescript
app.bsky.feed.post
app.bsky.feed.like
app.bsky.actor.profile
app.bsky.graph.follow
```

The schema types, definition language, and validation constraints are described in the [Lexicon specification](/specs/lexicon), and representations in JSON and CBOR are described in the [Data Model specification](/specs/data-model).

## Why is Lexicon needed?

**Interoperability.** An open network like atproto needs a way to agree on behaviors and semantics. Lexicon solves this while making it relatively simple for developers to introduce new schemas.

**Lexicon is not RDF.** While RDF is effective at describing data, it is not ideal for enforcing schemas. Lexicon is easier to use because it doesn't need the generality that RDF provides. In fact, Lexicon's schemas enable code-generation with types and validation, which makes life much easier!

## HTTP API methods

The AT Protocol's API system, [XRPC](/specs/xrpc), is essentially a thin wrapper around HTTPS. Its purpose is to apply the Lexicon to HTTPS. 

For example, a call to:

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
at://bob.com/com.example.follow/12345
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
      "createdAt": {"type": "string", "format": "datetime"}
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
  "description": "Traffic light state representing 'Go!'.",
}
{
  "lexicon": 1,
  "id": "com.example.yellow",
  "type": "token",
  "description": "Traffic light state representing 'Stop Soon!'.",
}
{
  "lexicon": 1,
  "id": "com.example.red",
  "type": "token",
  "description": "Traffic light state representing 'Stop!'.",
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
        "knownValues": [
          "com.example.green",
          "com.example.yellow",
          "com.example.red"
        ]
      },
    }
  }
}
```

## Versioning

Once a schema is published, it can never change its constraints. Loosening a constraint (adding possible values) will cause old software to fail validation for new data, and tightening a constraint (removing possible values) will cause new software to fail validation for old data. As a consequence, schemas may only add optional constraints to previously unconstrained fields.

If a schema must change a previously-published constraint, it should be published as a new schema under a new NSID.

## Schema distribution

Schemas are designed to be machine-readable and network-accessible. While it is not currently _required_ that a schema is available on the network, it is strongly advised to publish schemas so that a single canonical & authoritative representation is available to consumers of the method.
