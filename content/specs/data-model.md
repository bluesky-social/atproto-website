---
title: Data Model
summary: Consistent data encoding for records and messages.
---

# Data Model

Records and messages in atproto are stored, transmitted, encoded, and authenticated in a consistent way. The core "data model" is based on [Interplanetary Linked Data (IPLD)](https://ipld.io/docs/data-model/), a specification for hash-linked data structures from the IPFS ecosystem.

When data needs to be authenticated (signed), referenced (linked by content hash), or stored efficiently, it is encoded in Concise Binary Object Representation (CBOR). CBOR is an IETF standard roughly based on JSON. IPLD specifies a normalized subset of CBOR called **DAG-CBOR,** which is what atproto uses.

IPLD also specifies an analogous set of conventions of JSON called **DAG-JSON,** but atproto uses a different set of conventions when encoding JSON data.

The schema definition language for atproto is [Lexicon](/specs/lexicon). The IPLD Schema language is not used. Other lower-level data structures, like [repository](/specs/repository) internals, are not specified with Lexicons, but use the same data model and encodings.

In IPLD, distinct pieces of data are called **nodes,** and when encoded in binary (DAG-CBOR) result in a **block.** A node may have internal nested structure (maps or lists). Nodes may reference each other by string URLs or URIs, just like with regular JSON on the web. In IPLD, they can also reference each other strongly by hash, referred to in IPLD as a **link.** A set of linked nodes can form higher-level data structures like [Merkle Trees](https://en.wikipedia.org/wiki/Merkle_tree) or [Directed Acyclical Graphs (DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph). Links can also refer to arbitrary binary data (blobs).

Unlike URLs, hash references (links) do not encode a specific network location where the content can be found. The location and access mechanism must be inferred by protocol-level context. Hash references do have the property of being "self-certifying", meaning that returned data can be verified against the link hash. This makes it possible to redistribute content and trust copies even if coming from an untrusted party.

Links are encoded as [IPFS Content Identifiers](https://docs.ipfs.tech/concepts/content-addressing/#identifier-formats) (CIDs), which have both binary and string representations. CIDs include a metadata code which indicates whether it links to a node (DAG-CBOR) or arbitrary binary data. Some additional constraints on the use of CIDs in atproto are described below.

In atproto, object nodes often include a string field `$type` that specifies their Lexicon schema. Data is mostly self-describing and can be processed in schema-agnostic ways (including decoding and re-encoding), but can not be fully validated without the schema on-hand or known ahead of time.

## Data Types

| Lexicon Type  | IPLD Type | JSON                 | CBOR                    | Note                    |
| ---           | ---       | ---                  | ---                     | ---                     |
| `null`        | null      | Null                 | Special Value (major 7) |                         |
| `boolean`     | boolean   | Boolean              | Special Value (major 7) |                         |
| `integer`     | integer   | Number               | Integer (majors 0,1)    | signed, 64-bit          |
| `string`      | string    | String               | UTF-8 String (major 3)  | Unicode, UTF-8          |
| -             | float     | Number               | Special (major 7)       | not allowed in atproto  |
| `bytes`       | bytes     | `$bytes` Object      | Byte String (major 2)   |                         |
| `cid-link`    | link      | `$link` Object       | CID (tag 42)            | CID                     |
| `array`       | list      | Array                | Array (major 4)         |                         |
| `object`      | map       | Object               | Map (major 5)           | keys are always strings |
| `blob`        | -         | `$type: blob` Object | `$type: blob` Map       |                         |

`blob` is for references to files, such as images. It includes basic metadata like MIME Type and size (in bytes).

As a best practice to ensure Javascript compatibility with default types, `integer` should be limited to 53 bits of precision. Note that JSON numbers can have an arbitrary number of digits, but `integer` is limited to 64 bits even ignoring Javascript.

Lexicons can include additional validation constraints on individual fields. For example, integers can have maximum and minimum values. Data can not be validated against these additional constraints without access to the relevant Lexicon schema, but there is a concept of validating free-form JSON or CBOR against the atproto data model in an abstract sense. For example, a JSON object with a nested `$bytes` object with a boolean instead of a base64-encoded string might be valid JSON, but can never be valid under the atproto data model.

Lexicon string fields can have additional `format` type information associated with them for validation, but as with other validation constraints this information is not available without the Lexicon itself.

### Nullable and False-y

In the atproto data model there is a semantic difference between explicitly setting an map field to `null` and not including the field at all. Both JSON and CBOR have the same distinction.

Null or missing fields are also distinct from "false-y" value like `false` (for booleans), `0` (for integers), empty lists, or empty objects.

### Why No Floats?

IPLD, CBOR, and JSON all natively support floating point numbers, so why does atproto go out of the way to disallow them?

The IPLD specification describes some of the complexities and sharp edges when working with floats in a content-addressable world. In short, de-serializing in to machine-native format, then later re-encoding, is not always consistent. This is definitely true for special values and corner-cases, but can even be true with "normal" float values on less-common architectures.

It may be possible to come up with rules to ensure reliable round-trip encoding of floats in the future, but for now we disallow floats.

If you have a use-case where integers can not be substituted for floats, we recommend encoding the floats as strings or even bytes. This provides a safe default round-trip representation.

## `blob` Type

References to "blobs" (arbitrary files) have a consistent format in atproto, and can be detected and processed without access to any specific Lexicon. That is, it is possible to parse nodes and extract any blob references without knowing the schema.

Blob nodes are maps with following fields:

- `$type` (string, required): fixed value `blob`. Note that this is not a valid NSID.
- `ref` (link, required): CID reference to blob, with multicodec type `raw`. In JSON, encoded as a `$link` object as usual
- `mimeType` (string, required, not empty): content type of blob. `application/octet-stream` if not known
- `size` (integer, required, positive, non-zero): length of blob in bytes

There is also a deprecated legacy blob format, with some records in the wild still containing blob references in this format:

- `cid` (string, required): a CID in *string* format, not *link* format
- `mimeType` (string, required, not empty): same as `mimeType` above

Note that the legacy format has no `$type` and can only be parsed for known Lexicons. Implementations should not throw errors when encountering the old format, but should never write them, and it is acceptable to only partially support them.

## JSON Representation

atproto uses its own conventions for JSON, instead of using DAG-JSON directly. The main motivation was to have more idiomatic and human-readable representations for `link` and `bytes` in HTTP APIs. The DAG-JSON specification itself mentions that it is primarily oriented toward debugging and development environments, and we found that the use of `/` as a field key was confusing to developers.

Normalizations like key sorting are also not required or enforced when using JSON in atproto: only DAG-CBOR is used as a byte-reproducible representation.

The encoding for most of the core and compound types is straight forward, with only `link` and `bytes` needing special treatment.

### `link`

The JSON encoding for an IPLD Link is an object with the single key `$link` and the string-encoded CID as a value.

For example, a node with a single field `"exampleLink"` with type `link` would encode in JSON like:

```
{
  "exampleLink": {
    "$link": "bafyreidfayvfuwqa7qlnopdjiqrxzs6blmoeu4rujcjtnci5beludirz2a"
  }
}

```

For comparison, this is very similar to the DAG-JSON encoding, but substitutes `$link` as the key name instead of `/` (single-character, forward slash).

### `bytes`

The JSON encoding for bytes is an object with the single key `$bytes` and string value with the base64-encoded bytes. The base64 scheme is the one specified in [RFC-4648, section 4](https://datatracker.ietf.org/doc/html/rfc4648#section-4), frequently referred to as simple "base64". This scheme is not URL-safe, and `=` padding is optional.

For example, a node with a single field `"exampleBytes"` with type `bytes` would be represented in JSON like:

```
{
  "exampleBytes": {
    "$bytes": "nFERjvLLiw9qm45JrqH9QTzyC2Lu1Xb4ne6+sBrCzI0"
  }
}

```

For comparison, the DAG-JSON encoding has two nested objects, with outer key `/` (single-character, forward slash), inner key `bytes`, and the same base64 encoding.

## Link and CID Formats

The [IPFS CID specification](https://github.com/multiformats/cid) is very flexible. It supports a wide variety of hash types, a field indicating the "type" of content being linked to, and various string encoding options. These features are valuable to allow evolution over time, but to maximize interoperability among implementations, only a specific "blessed" set of CID types are allowed.

The blessed formats for CIDs in atproto are:

- CIDv1
- multibase: binary serialization within DAG-CBOR `link` fields, and `base32` for string encoding
- multicodec: `dag-cbor` (0x71) for links to data objects, and `raw` (0x55) for links to blobs
- multihash: `sha-256` with 256 bits (0x12) is preferred

The use of SHA-256 is a stable requirement in some contexts, such as the repository MST nodes. In other contexts, like referencing media blobs, there will likely be a set of "blessed" hash types which evolve over time. A balance needs to be struck between protocol flexibility on the one hand (to adopt improved hashes and remove weak ones), and ensuring broad and consistent interoperability throughout an ecosystem of protocol implementations.

There are several ways to include a CID hash reference in an atproto object:

- `link` field type (Lexicon type `cid-link`). In DAG-CBOR encodes as a binary CID (multibase type 0x00) in a bytestring with CBOR tag 42. In JSON, encodes as `$link` object (see above)
- `string` field type, with Lexicon string format `cid`. In DAG-CBOR and JSON, encodes as a simple string
- `string` field type, with Lexicon string format `uri`, with URI scheme `ipld://`

## Usage and Implementation Guidelines

When working with the deprecated/legacy "blob" format, it is recommend to store in the same internal representation as regular "blob" references, but to set the `size` to zero or a negative value. This field should be checked when re-serializing to ensure proper round-trip behavior and avoid ever encoding a zero or negative `size` value in the normal object format.

## Security and Privacy Considerations

There are a number of resource-consumption attacks possible when parsing untrusted CBOR content. It is recommended to use a library that automatically protects against huge allocations, deep nesting, invalid references, etc. This is particularly important for libraries implemented in languages without strong memory safety, such as C and C++. Note that high-level languages frequently wrap parsers written in lower-level languages.

## Possible Future Changes

Floats may be supported in one form or another.

The legacy "blob" format may be entirely removed, if all known records and repositories can be rewritten.

Additional hash types are likely to be included in the set of "blessed" CID configurations.
