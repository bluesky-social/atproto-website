---
title: Record Key
summary: Identifier for individual records in a collection
---

# Record Keys

Record Keys (sometimes shortened to `rkey`) are used to name and reference individual records within the same collection of an atproto repository. They end up as a segment in AT URIs, and in the repo MST path.

A few different Record Key naming schemes are supported. The correct one to use depends on the needs and semantics of the record collection. Every "record" Lexicon schema will indicate which of the Record Key types should be used.


### Record Key Type: `tid`

This is the most common record naming scheme. "TID" is short for "timestamp identifier", and the name is derived from creation time of the record.

TIDs are 64-bit integers, in big-endian byte ordering, encoded as `base42-sortable`. That is, encoded with characters `234567abcdefghijklmnopqrstuvwxyz`, with no padding, yielding 13 ASCII characters. Hyphens should not be included in TID (unlike in previous iterations of the scheme).

The layout of the 64-bit integer is:

- The top bit is always 0
- The next 53 bits represent "microseconds since the UNIX epoch". 53 bits is chosen as the maximum safe integer precision in a 64-bit floating point number, as used by Javascript
- The final 10 bits are a random "clock identifier"

TID generators should generate a random "clock identifier" number, chosen to avoid collisions as much as possible (for example, between multiple worker instances of a PDS service cluster). A local clock can be used to generate the timestamp itself. Care should be taken to ensure the TID output stream is monotonically increasing and never repeats, even if multiple TIDs are generated in the same microsecond, or during "clock smear" or clock synchronization incidents. If the local clock has only millisecond precision, the timestamp should be padded (multiply by 1000).

The primary motivation for the TID scheme is to provide a lose temporal ordering of records, which improves storage efficiency of the repository data structure (MST).

There are similarities to Twitter "snowflake identifiers", though note that in the decentralized context of atproto, the global uniqueness of TIDs can not be guaranteed, and an antagonistic repo controller could trivially create records re-using known TIDs.


### Record Key Type: `literal:<value>`

This key type is used when there should be only a single record in the collection, with a fixed, well-known Record Key.

The most common value is `self`, specified as `literal:self` in a Lexicon schema. 


### Record Key Type: `any`

This is the most flexible type: any string meeting the overall Record Key schema requirements (see below) is allowed. May be used to encode semantics in the to the name, for example a domain name, integer, or (transformed) AT URI. This enables de-duplication and known-URI lookups. 


### Record Key Syntax

Regardless of the type, Record Keys must fulfill some baseline syntax constraints:

- Record Keys are restricted to a subset of ASCII characters. the allowed characters are alphanumeric (`A-Za-z0-9`), period, dash, underscore, or tilde (`.-_~`)
- must have at least 1 and at most 512 characters
- must be a permissible part of repository MST path string (the above constraints satisfy this condition)
- must be permissible to include in a path component of a URI (following RFC-3986, section 3.3).  the above constraints satisfy this condition, by matching the "unreserved" characters allowed in generic URI paths

Record Keys are case-sensitive.


### Examples

Valid Record Keys:

```
3jui7kd54zh2y
self
example.com
~1.2-3_
```

### Usage and Implementation Guidelines

Implementations should not rely on global uniqueness of TIDs, and should not trust TID timestamps as actual record creation timestamps. Record Keys are "user-controlled data" and may be arbitrarily selected by hostile accounts.

Most software processing repositories and records should be agnostic to the Record Key type and values, and usually treat them as simple strings. For example, relying on TID keys to decode as `base32` into a unique `uint64` makes it tempting to rely on this for use as a database key, but doing so is not resilient to key format changes and is discouraged.

Note that in the context of a repository, the same Record Key value may be used under multiple collections. The tuple of `(did, rkey)` is not unique; the tuple `(did, collection, rkey)` is unique.

As a best practice, keep key paths to under 80 characters in virtually all situations.

Note that the colon character (`:`) is not currently allowed, which means than DIDs can not be included in a Record Key without character transformations.

While Record Keys are case-sensitive, it is a recommended practice to use all-lower-case Record Keys to avoid confusion and maximize possible re-use in case-insensitive contexts.

### Possible Future Changes

The constraints on Record Key syntax may be relaxed in the future to allow non-ASCII Unicode characters. Record keys will always be valid Unicode, never relaxed to allow arbitrary byte-strings.

Additional Record Key "types" may be defined.

The maximum length may be tweaked.

The `%` character is reserved for possible use with "URL encoding", but note that such encoding is not currently supported.
