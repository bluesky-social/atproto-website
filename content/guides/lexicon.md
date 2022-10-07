---
title: Intro to Lexicon
summary: Applying Lexicon schemas in ATP method calls and data records.
---

# Intro to Lexicon

TODO

Schemas define the possible values of a record. Every record has a "type" which maps to a schema. Schemas are also used to distinguish collections of records, and are used to drive permissioning.

### Schema distribution

Schemas are designed to be machine-readable and network-accessible. While it is not currently _required_ that a schema is available on the network, it is strongly advised to publish schemas so that a single canonical & authoritative representation is available to consumers of the method.

To fetch a schema, a request must be sent to the xrpc [`getSchema`](../xrpc.md#getschema) method. This request is sent to the authority of the NSID.

### Schema structure

Record schemas are encoded in JSON using [Lexicon Schema Documents](../lexicon.md).

### Reserved field names

There are a set of fields which are reserved in ADX and shouldn't be used by schemas.

|Field|Usage|
|-|-|
|`$type`|Declares the type of a record.|
|`$ext`|Contains extensions to a record's base schema.|
|`$required`|Used by extensions to flag whether their support is required.|
|`$fallback`|Used by extensions to give a description of the missing data.|

Generally it's wise to avoid `$` prefixes in your fieldnames.

### Schema validation

Constraints are structural: they apply constraints to fields under object path (eg `#/text`) to establish permissable values for that field. The constraints they can apply are value-type and valid values of the type (eg numbers within a range, strings of a certain format or pattern, etc). These constraints are described using [JSON Schema](https://json-schema.org/draft/2020-12/json-schema-core.html).

Unconstrained fields are ignored during validation, but should be avoided in case future versions of the schema apply constraints.

### Schema versioning

Once a field constraint is published, it can never change. Loosening a constraint (adding possible values) will cause old software to fail validation for new data, and tightening a constraint (removing possible values) will cause new software to fail validation for old data. As a consequence, schemas may only add optional constraints, and only to previously unconstrained fields.

A "revision" field is used to indicate this change, but it has no enforced meaning. It simply is used to help developers track revisions. If a schema must change a previously-published constraint, it should be published as a new schema under a new NSID.

### Schema extension

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
