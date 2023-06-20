---
title: Lexicon
summary: A schema definition language.
---

# Lexicon

Lexicon is a schema definition language used to describe atproto records, HTTP endpoints (XRPC), and event stream messages. It builds on top of the atproto [Data Model](/specs/data-model).

The schema language is similar to [JSON Schema](http://json-schema.org/) and [OpenAPI](https://en.wikipedia.org/wiki/OpenAPI_Specification), but includes some atproto-specific features and semantics.

This specification describes version 1 of the Lexicon definition language.

## Overview of Types

| Lexicon Type | Data Model Type | Category |
| --- | --- | --- |
| `null` | Null | concrete |
| `boolean` | Boolean | concrete |
| `integer` | Integer | concrete |
| `string` | String | concrete |
| `bytes` | Bytes | concrete |
| `cid-link` | Link | concrete |
| `blob` | Blob | concrete |
| `array` | Array | container |
| `object` | Object | container |
| `params` |  | container |
| `token` |  | meta |
| `ref` |  | meta |
| `union` |  | meta |
| `unknown` |  | meta |
| `record` |  | primary |
| `query` |  | primary |
| `procedure` |  | primary |
| `subscription` |  | primary |

## Lexicon Files

Lexicons are JSON files associated with a single NSID. A file contains one or more definitions, each with a distinct short name. A definition with the name `main` optionally describes the "primary" definition for the entire file. A Lexicon with zero definitions is invalid.

A Lexicon JSON file is an object with the following fields:

- `lexicon` (integer, required): indicates Lexicon language version. In this version, a fixed value of `1`
- `id` (string, required): the NSID of the Lexicon
- `revision` (integer, optional): indicates the version of this Lexicon, if changes have occurred
- `description` (string, optional): short overview of the Lexicon, usually one or two sentences
- `defs` (map of strings-to-objects, required): set of definitions, each with a distinct name (key)

Schema definitions under `defs` all have a `type` field to distinguish their type. A file can have at most one definition with one of the "primary" types. Primary types should always have the name `main`. It is possible for `main` to describe a non-primary type.

References to specific definitions within a Lexicon use fragment syntax, like `com.example.defs#someView`. If a `main` definition exists, it can be referenced without a fragment, just using the NSID.

The semantics of the `revision` field have not been worked out yet, but are intended to help third parties identity the most recent among multiple versions or copies of a Lexicon.

Related Lexicons are often grouped together in the NSID hierarchy. As a convention, any definitions used by multiple Lexicons are defined in a dedicated `*.defs` Lexicon (eg, `com.atproto.server.defs`) within the group. A `*.defs` Lexicon should not include a definition named `main`, though it is not strictly invalid to do so.

## Primary Type Definitions

The primary types are:

- `query`: describes an XRPC Query (HTTP GET)
- `procedure`: describes an XRPC Procedure (HTTP POST)
- `subscription`: Event Stream (WebSocket)
- `record`: describes an object that can be stored in a repository record

Each primary definition schema object includes these fields:

- `type` (string, required): the type value (eg, `record` for records)
- `description` (string, optional): short, usually only a sentence or two

### Record

Type-specific fields:

- `key` (string, required): specifies the [Record Key type](/specs/record-key)
- `record` (object, required): a schema definition with type `object`, which specifies this type of record

### Query and Procedure (HTTP API)

Type-specific fields:

- `parameters` (object, optional): a schema definition with type `params`, describing the HTTP query parameters for this endpoint
- `output` (object, optional): describes the HTTP response body
    - `description` (string, optional): short description
    - `encoding` (string, required): MIME type for body contents
    - `schema` (object, required): schema definition, either an `object`, a `ref`, or a `union` of refs
- `input` (object, optional, only for `procedure`): describes HTTP request body schema, with the same format as the `output` field
- `errors` (array of objects, optional): set of string error codes which might be returned
    - `name` (string, required): short name for the error type, with no whitespace
    - `description` (string, optional): short description, one or two sentences

### Subscription (Event Stream)

Type-specific fields:

- `parameters` (object, optional): same as Query and Procedure
- `message` (object, optional): specifies what messages can be
    - `description` (string, optional): short description
    - `schema` (object, required): schema definition, which must be a `union` of refs
- `errors` (array of objects, optional): same as Query and Procedure

Subscription schemas (referenced by the `schema` field under `message`) must be a `union` of refs, not an `object` type.

## Field Type Definitions

As with the primary definitions, every schema object includes these fields:

- `type` (string, required): fixed value for each type
- `description` (string, optional): short, usually only a sentence or two

### `null`

No additional fields.

### `boolean`

Type-specific fields:

- `default` (boolean, optional): a default value for this field
- `const` (boolean, optional): a fixed (constant) value for this field

When included as an HTTP query parameter, should be rendered as `true` or `false` (no quotes).

### `integer`

A signed integer number.

Type-specific fields:

- `minimum` (integer, optional): minimum acceptable value
- `maximum` (integer, optional): maximum acceptable value
- `enum` (array of integers, optional): a closed set of allowed values
- `default` (integer, optional): a default value for this field
- `const` (integer, optional): a fixed (constant) value for this field

### `string`

Type-specific fields:

- `format` (string, optional): string format restriction
- `maxLength` (integer, optional): maximum length of value, in UTF-8 bytes
- `minLength` (integer, optional): minimum length of value, in UTF-8 bytes
- `maxGraphemes` (integer, optional): maximum length of value, counted as Unicode Grapheme Clusters
- `minGraphemes` (integer, optional): minimum length of value, counted as Unicode Grapheme Clusters
- `knownValues` (array of strings, options: a set of suggested or common values for this field. Values are not limited to this set (aka, not a closed enum).
- `enum` (array of strings, optional): a closed set of allowed values
- `default` (string, optional): a default value for this field
- `const` (string, optional): a fixed (constant) value for this field

Strings are Unicode. For non-Unicode encodings, use `bytes` instead. The basic `minLength`/`maxLength` validation constraints are counted as UTF-8 bytes. Note that Javascript stores strings with UTF-16 by default, and it is necessary to re-encode to count accurately. The `minGraphemes`/`maxGraphemes` validation constraints work with Grapheme Clusters, which have a complex technical and linguistic definition, but loosely correspond to "distinct visual characters" like Latin letters, CJK characters, punctuation, digits, or emoji (which might comprise multiple Unicode codepoints and many UTF-8 bytes).

`format` constrains the string format and provides additional semantic context. Refer to the Data Model specification for the available format types and their definitions.

`const` and `default` are mutually exclusive.

### `bytes`

Type-specific fields:

- `minLength` (integer, optional): minimum size of value, as raw bytes with no encoding
- `maxLength` (integer, optional): maximum size of value, as raw bytes with no encoding

### `cid-link`

No type-specific fields.

See [Data Model spec](/specs/data-model) for CID restrictions.

### `array`

Type-specific fields:

- `items` (object, required): describes the schema elements of this array
- `minLength` (integer, optional): minimum count of elements in array
- `maxLength` (integer, optional): maximum count of elements in array

In theory arrays have homogeneous types (meaning every element as the same type). However, with union types this restriction is meaningless, so implementations can not assume that all the elements have the same type.

### `object`

A generic object schema which can be nested inside other definitions by reference.

Type-specific fields:

- `properties` (map of strings-to-objects, required): defines the properties (fields) by name, each with their own schema
- `required` (array of strings, optional): indicates which properties are required
- `nullable` (array of strings, optional): indicates which properties can have `null` as a value

As described in the data model specification, there is a semantic difference in data between omitting a field; including the field with the value `null`; and including the field with a "false-y" value (`false`, `0`, empty array, etc).

### `blob`

Type-specific fields:

- `accept` (array of strings, optional): list of acceptable MIME types. Each may end in `*` as a glob pattern (eg, `image/*`). Use `*/*` to indicate that any MIME type is accepted.
- `maxSize` (integer, optional): maximum size in bytes

### `params`

This is a limited-scope type which is only ever used for the `parameters` field on `query`, `procedue`, and `subscription` primary types. These map to HTTP query parameters.

Type-specific fields:

- `required` (array of strings, optional): same semantics as field on `object`
- `properties`: similar to properties under `object`, but can only include the types `boolean`, `integer`, `string`, and `unknown`; or an `array` of one of these types

Note that unlike `object`, there is no `nullable` field on `params`.

### `token`

Tokens are empty data values which exist only to be referenced by name. They are used to define a set of values with specific meanings. The `description` field should clarify the meaning of the token.

Tokens are similar to the concept of a "symbol" in some programming languages, distinct from strings, variables, built-in keywords, or other identifiers.

For example, tokens could be defined to represent the state of an entity (in a state machine), or to enumerate a list of categories.

No type-specific fields.

### `ref`

Type-specific fields:

- `ref` (string, required): reference to another schema definition

Refs are a mechanism for re-using a schema definition in multiple places. The `ref` string can be a global reference to a Lexicon type definition (an NSID, optionally with a `#`-delimited name indicating a definition other than `main`), or can indicate a local definition within the same Lexicon file (a `#` followed by a name).

### `union`

Type-specific fields:

- `refs` (array of strings, required): references to schema definitions
- `closed` (boolean, optional): indicates if a union is "open" or "closed". defaults to `false` (open union)

Unions represent that multiple possible types could be present at this location in the schema. The references follow the same syntax as `ref`, allowing references to both global or local schema definitions. Actual data will validate against a single specific type: the union does not *combine* fields from multiple schemas, or define a new *hybrid* data type. The different types are referred to as **variants**.

By default unions are "open", meaning that future revisions of the schema could add more types to the list of refs (though can not remove types). This means that implementations should be permissive when validating, in case they do not have the most recent version of the Lexicon. The `closed` flag (boolean) can indicate that the set of types is fixed and can not be extended in the future.

A `union` schema definition with no `refs` is allowed and similar to `unknown`, as long as the `closed` flag is false (the default). An empty refs list with `closed` set to true is an invalid schema.

The schema definitions pointed to by a `union` are generally objects or types with a clear mapping to an object, like a `record`. All the variants must be represented by a CBOR map (or JSON Object) and include a `$type` field indicating the variant type.

### `unknown`

Indicates than any data could appear at this location, with no specific validation. Note that the data must still be valid under the data model: it can't contain unsupported things like floats.

No type-specific fields.

## String Formats

Strings can optionally be constrained to one of the following `format` types:

- `at-identifier`: either a [Handle](/specs/handle) or a [DID](/specs/did), details described below
- `at-uri`: [AT-URI](/specs/at-uri-scheme)
- `cid`: CID in string format, details specified in [Data Model](/specs/data-model)
- `datetime`: timestamp, details specified below
- `did`: generic [DID Identifier](/specs/did)
- `handle`: [Handle Identifier](/specs/handle)
- `nsid`: [Namespaced Identifier](/specs/handle)
- `uri`: generic URI, details specified below

For the various identifier formats, when doing Lexicon schema validation the most expansive identifier syntax format should be permitted. Problems with identifiers which do pass basic syntax validation should be reported as application errors, not lexicon data validation errors. For example, data with any kind of DID in a `did` format string field should pass Lexicon validation, with unsupported DID methods being raised separately as an application error.

### `at-identifier`

A string type which is either a DID (type: did) or a handle (handle). Mostly used in XRPC query parameters. It is unambiguous whether an at-identifier is a handle or a DID because a DID always starts with did:, and the colon character (:) is not an allowed in handles.

### `datetime`

Full-precision date and time, with timezone information.

Datetime format standards are notoriously flexible and overlapping. Datetime strings in atproto should meet the [intersecting](https://ijmacd.github.io/rfc3339-iso8601/) requirements of RFC 3339, ISO 8601, and the WHATWG HTML standard.

Best practice is to use UTC timezone, and represent this is a capitalized `Z` suffix. An upper-case `T` is required for separating the "date" and "time" parts.

Whole seconds precision is required, and arbitrary fractional precision digits are allowed. Best practice is to use at least millisecond precision, and to pad with zeros to the generated precision (eg, trailing `:12.340Z` instead of `:12.34Z`). Not all datetime formatting libraries support trailing zero formatting. Both millisecond and microsecond precision have reasonable cross-language support; nanosecond precision does not.

Implementations should be aware when round-tripping records containing datetimes of two ambiguities: loss-of-precision, and ambiguity with trailing fractional second zeros. If de-serializing Lexicon records in to native types, and then re-serializing, the string representation may not be the same, which could result in broken hash references, sanity check failures, or repository update churn. A safer thing to do is to deserialize the datetime as a simple string, which ensures round-trip re-serialization.

Valid examples:

```
// preferred
1985-04-12T23:20:50.123Z
1985-04-12T23:20:50.123456Z
1985-04-12T23:20:50.120Z
1985-04-12T23:20:50.120000Z

// supported
1985-04-12T23:20:50.1235678912345Z
1985-04-12T23:20:50.100Z
1985-04-12T23:20:50Z
1985-04-12T23:20:50.0Z
1985-04-12T23:20:50.123+00:00
1985-04-12T23:20:50.123-07:00

```

Invalid examples:

```
1985-04-12 23:20:50.123Z
1985-04-12t23:20:50.123Z
1985-04-12T23:20:50.123z
1985-04-12
1985-04-12T23:20Z
1985-04-12T23:20:5Z
1985-04-12T23:20:50.123
+001985-04-12T23:20:50.123Z
23:20:50.123Z

```

### `uri`

Flexible to any URI schema, following the generic RFC-3986 on URIs. This includes, but isn’t limited to: `did`, `https`, `wss`, `ipfs` (for CIDs), `dns`, and of course `at`.
Maximum length in Lexicons is 8 KBytes.

## When to use `$type`

Data objects sometimes include a `$type` field which indicates their Lexicon type. The general principle is that this field needs to be included any time there could be ambiguity about the content type when validating data.

The specific rules are:

- `record` objects must always include `$type`. While the type is often known from context (eg, the collection part of the path for records stored in a repository), record objects can also be passed around outside of repositories and need to be self-describing
- `union` variants must always include `$type`, except at the top level of `subscription` messages

Note that `blob` objects always include `$type`, which allows generic processing.

## Lexicon Evolution

Lexicons are allowed to change over time, within some bounds to ensure both forwards and backwards compatibility. The basic principle is that all old data must still be valid under the updated Lexicon, and new data must be valid under the old Lexicon.

- Any new fields must be optional
- Non-optional fields can not be removed. A best practice is to retain all fields in the Lexicon and mark them as deprecated if they are no longer used.
- Types can not change
- Fields can not be renamed

If larger breaking changes are necessary, a new Lexicon name must be used.

It can be ambiguous when a Lexicon has been published and becomes "set in stone". At a minimum, public adoption and implementation by a third party, even without explicit permission, indicates that the Lexicon has been released and should not break compatibility. A best practice is to clearly indicate in the Lexicon type name any experimental or development status. Eg, `com.corp.experimental.newRecord`.

## Authority and Control

The authority for a Lexicon is determined by the NSID, and rooted in DNS control of the domain authority. That authority has ultimate control over the Lexicon definition, and responsibility for maintenance and distribution of Lexicon schema definitions.

In a crisis, such as unintentional loss of DNS control to a bad actor, the protocol ecosystem could decide to disregard this chain of authority. This should only be done in exceptional circumstances, and not as a mechanism to subvert an active authority. The primary mechanism for resolving protocol disputes is to fork Lexicons in to a new namespace.

Protocol implementations should generally consider data which fails to validate against the Lexicon to be entirely invalid, and should not try to repair or do partial processing on the individual piece of data.

Unexpected fields in data which otherwise conforms to the Lexicon should be ignored. When doing schema validation, they should be treated at worst as warnings. This is necessary to allow evolution of the schema by the controlling authority, and to be robust in the case of out-of-date Lexicons.

Third parties can technically insert any additional fields they want in to data. This is not the recommended way to extend applications, but it is not specifically disallowed. One danger with this is that the Lexicon may be updated to include fields with the same field names but different types, which would make existing data invalid.

## Usage and Implementation Guidelines

It should be possible to translate Lexicon schemas to JSON Schema or OpenAPI and use tools and libraries from those ecosystems to work with atproto data in JSON format.

Implementations which serialize and deserialize data from JSON or CBOR in to structures derived from specific Lexicons should be aware of the risk of "clobbering" unexpected fields. For example, if a Lexicon is updated to add a new (optional) field, old implementations would not be aware of that field, and might accidentally strip the data when de-serializing and then re-serializing. Depending on the context, one way to avoid this problem is to retain any "extra" fields, or to pass-through the original data object instead of re-serializing it.

## Possible Future Changes

The validation rules for unexpected additional fields may change. For example, a mechanism for Lexicons to indicate that the schema is "closed" and unexpected fields are not allowed, or a convention around field name prefixes (`x-`) to indicate unofficial extension.
