---
title: AT URI scheme (at://)
summary: A URI scheme for addressing ATP repository data.
---

# AT URI Scheme (at://)

The AT URI scheme (`at://`) makes it easy to reference individual records in a specific repository, identified by either DID or handle. AT URIs can also be used to reference a collection within a repository, or an entire repository (aka, an identity).

Both of these AT URIs reference the same record in the same repository; one uses the account’s DID, and one uses the account’s handle.

- `at://did:plc:44ybard66vv44zksje25o7dz/app.bsky.feed.post/3jwdwj2ctlk26`
- `at://bnewbold.bsky.team/app.bsky.feed.post/3jwdwj2ctlk26`

The full, general structure of an AT URI is:

```text
"at://" AUTHORITY [ PATH ] [ "?" QUERY ] [ "#" FRAGMENT ]
```

The **authority** part of the URI can be either a handle or a DID, indicating the identity associated with the repository.

In current atproto Lexicon use, the **query** and **fragment** parts are not yet supported, and only a fixed pattern of paths are allowed:

```text
"at://" AUTHORITY [ "/" COLLECTION [ "/" RKEY ] ]
```

The **authority** section is required, must be normalized, and if a DID must be one of the "blessed" DID methods. The optional **collection** part of the path must be a normalized [NSID](./nsid). The optional **rkey** part of the path must be a valid [Record Key](./record-key).

A major semantic difference between AT URIs and common URL formats like `https://`, `ftp://`, or `wss://` is that the "authority" part of an AT URI does not indicate a network location for the indicated resource. Even when a handle is in the authority part, the hostname is only used for identity lookup, and is often not the ultimate host for repository content (aka, the handle hostname is often not the PDS host).

### Generic URI Compliance

AT URIs meet the generic syntax for Universal Resource Identifiers, as defined in IETF [RFC-3986](https://www.rfc-editor.org/rfc/rfc3986). They utilize some generic URI features outlined in that document, though not all. As a summary of generic URI parts and features:

- Authority part, preceded by double slash: supported
- Empty authority part: not supported
- Userinfo: not currently supported, but reserved for future use. a lone `@` character preceding a handle is not valid (eg, `at://@handle.example.com` is not valid)
- Host and port separation: not supported. syntax conflicts with DID in authority part
- Path part: supported, optional
- Query: supported in general syntax, not currently used
- Fragment: supported in general syntax, not currently used
- Relative references: not yet supported
- Normalization rules: supported in general syntax, not currently used

AT URIs are not compliant with the WHATWG URL Standard ([https://url.spec.whatwg.org/](https://url.spec.whatwg.org/)). Un-encoded colon characters in DIDs in the authority part of the URI are disallowed by that standard. Note that it is possible to un-ambigiously differentiate a DID in the authority section from a `host:port` pair. DIDs always have at least two colons, always begin with `did:`, and the DID method can not contain digits.

### Full AT URI Syntax

The full syntax for AT URIs is flexible to a variety of future use cases, including future extensions to the path structure, query parameters, and a fragment part. The full syntax rules are:

- The overall URI is restricted to a subset of ASCII characters
- For reference below, the set of unreserved characters, as defined in [RFC-3986](https://www.rfc-editor.org/rfc/rfc3986), includes alphanumeric (`A-Za-z0-9`), period, hyphen, underscore, and tilde (`.-_~`)
- Maximum overall length is 8 kilobytes (which may be shortened in the future)
- Hex-encoding of characters is permitted (but in practice not necessary)
- The URI scheme is `at`, and an authority part preceded with double slashes is always required, so the URI always starts `at://`
- An authority section is required and must be non-empty. the authority can be either an atproto Handle, or a DID meeting the restrictions for use with atproto. note that the authority part can *not* be interpreted as a host:port pair, because of the use of colon characters (`:`) in DIDs. Colons and unreserved characters should not be escaped in DIDs, but other reserved characters (including `#`, `/`, `$`, `&`, `@`) must be escaped.
    - Note that none of the current "blessed" DID methods for atproto allow these characters in DID identifiers
- An optional path section may follow the authority. The path may contain multiple segments separated by a single slash (`/`). Generic URI path normalization rules may be used.
- An optional query part is allowed, following generic URI syntax restrictions
- An optional fragment part is allowed, using JSON Path syntax


### Restricted AT URI Syntax

A restricted sub-set of valid AT URIs are currently used in Lexicons for the `at-uri` type. Query parameters and fragments are not currently used. Trailing slashes are not allowed, including a trailing slash after the authority with no other path. The URI should be in normalized form (see "Normalization" section), with all of the individual sub-identifiers also normalized.

```text
AT-URI        = "at://" AUTHORITY [ "/" COLLECTION [ "/" RKEY ] ]

AUTHORITY     = HANDLE | DID
COLLECTION    = NSID
RKEY          = RECORD-KEY
```


### Normalization

Particularly when included in atproto records, strict normalization should be followed to ensure that the representation is reproducible and can be used with simple string equality checks.

- No unnecessary hex-encoding in any part of the URI
- Any hex-encoding hex characters must be upper-case
- URI schema is lowercase
- Authority as handle: lowercased
- Authority as DID: in normalized form, and no duplicate hex-encoding. For example, if the DID is already hex-encoded, don’t re-encode the percent signs.
- No trailing slashes in path part
- No duplicate slashes or "dot" sections in path part (`/./` or `/abc/../` for example)
- NSID in path: domain authority part lowercased
- Record Key is case-sensitive and not normalized
- Query and fragment parts should not be included when referencing repositories or records in Lexicon records

Refer to [RFC-3986](https://www.rfc-editor.org/rfc/rfc3986) for generic rules to normalize paths and remove `..` / `.` relative references.


### Examples

Valid AT URIs (both general and Lexicon syntax):

```text
at://foo.com/com.example.foo/123
```

Valid general AT URI syntax, invalid in current Lexicon:

```text
at://foo.com/example/123     // invalid NSID
at://computer                // not a valid DID or handle
at://example.com:3000        // not a valid DID or handle
```

Invalid AT URI (in both contexts)

```text
at://foo.com/                // trailing slash
at://user:pass@foo.com       // userinfo not currently supported
```


### Usage and Implementation Guidelines

Generic URI and URL parsing libraries can sometimes be used with AT URIs, but not always. A key requirement is the ability to work with the authority (or origin) part of the URI as a simple string, without being parsed in to userinfo, host, and port sub-parts. Specifically: the Python 3 `urllib` module (from the standard library) works; the Javascript `url-parse` package works; the Golang `net/url` package does not work; and most of the popular Rust URL parsing crates do not work.

When referencing records, especially from other records, best practice is to use a DID in the authority part, not a handle. For application display, a handle can be used as a more human-readable alternative. In HTML, it is permissible to *display* the handle version of an AT-URI and *link* (`href`) to the DID version.

Do not confuse the JSON Path fragment syntax with the Lexicon reference syntax. They both use `#`-based fragments to reference other fields in JSON documents, but, for example, JSON Path syntax starts with a slash (`#/key`).


### Possible Future Changes

The maximum length constraint may change.

Relative references may be supported in Lexicons in `at-uri` fields. For example, one record referencing other records in the same repository could use `../<collection>/<rkey>` relative path syntax.
