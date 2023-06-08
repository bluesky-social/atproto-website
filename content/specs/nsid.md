---
title: Namespaced Identifiers (NSIDs)
summary: A specification for global semantic IDs.
---

# Namespaced Identifiers (NSIDs)
Namespaced Identifiers (NSIDs) are used to reference Lexicon schemas for records, XRPC endpoints, and more.

The basic structure and semantics of an NSID are a fully-qualified hostname in Reverse Domain-Name Order, followed by a simple name. The hostname part is the **domain authority,** and the final segment is the **name**.


### NSID Syntax

Lexicon string type: `nsid`

The domain authority part of an NSID must be a valid handle with the order of segments reversed. That is followed by a name segment which must be an ASCII camel-case string.

For example, `com.example.fooBar` is a syntactically valid NSID, where `com.example` is the domain authority, and `fooBar` is the name segment.

The comprehensive list of syntax rules is:

- Overall NSID:
    - must contain only ASCII characters
    - separate the domain authority and the name by an ASCII period character (`.`)
    - must have at least 3 segments
    - can have a maximum total length of 317 characters
- Domain authority:
    - made of segments separated by periods (`.`)
    - at most 253 characters (including periods), and must contain at least two segments
    - each segment must have at least 1 and at most 63 characters (not including any periods)
    - the allowed characters are ASCII letters (`a-z`), digits (`0-9`), and hyphens (`-`)
    - segments can not start or end with a hyphen
    - the first segment (the top-level domain) can not start with a numeric digit
    - the domain authority is not case-sensitive, and should be normalized to lowercase (that is, normalize ASCII `A-Z` to `a-z`)
- Name:
    - must have at least 1 and at most 63 characters
    - the allowed characters are ASCII letters only (`A-Z`, `a-z`)
    - digits and hyphens are not allowed
    - case-sensitive and should not be normalized

A reference regex for NSID is:

```
/^[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(\.([a-zA-Z]{1,63}))$
```


### NSID Syntax Variations

A **fragment** may be appended to an NSID in some contexts to refer to a specific sub-field within the schema. The fragment is separated from the NSID by an ASCII hash character (`#`). The fragment identifier string (after the `#`) has the same syntax restrictions as the final segment of an NSID: ASCII alphabetic, one or more characters, length restricted, etc.

When referring to a group or pattern of NSIDs, a trailing ASCII star character (`*`) can be used as a "glob" character. For example, `com.atproto.*` would refer to any NSIDs under the `atproto.com` domain authority, including nested sub-domains (sub-authorities). A free-standing `*` would match all NSIDs from all authorities. Currently, there may be only a single start character; it must be the last character; and it must be at a segment boundary (no partial matching of segment names). This means the start character must be proceeded by a period, or be a bare star matching all NSIDs.


### Examples

Syntactically valid NSIDs:

```
com.example.fooBar
net.users.bob.ping
a-0.b-1.c
a.b.c
cn.8.lex.stuff
```

Invalid NSIDs:

```
com.exa💩ple.thing
com.example
```


### Usage and Implementation Guidelines

A **strongly-encouraged** best practice is to use authority domains with only ASCII alphabetic characters (that is, no digits or hyphens). This makes it significantly easier to generate client libraries in most programming languages.

The overall NSID is case-sensitive for display, storage, and validation. However, having multiple NSIDs that differ only by casing is not allowed. Namespace authorities are responsible for preventing duplication and confusion. Implementations should not force-lowercase NSIDs.

It is common to use "subdomains" as part of the "domain authority" to organize related NSIDs. For example, the NSID `com.atproto.sync.getHead` uses the `sync` segment. Note that this requires control of the full domain `sync.atproto.com`, in addition to the domain `atproto.com`.

Lexicon language documentation will provide style guidelines on choosing and organizing NSIDs for both record types and XRPC methods. In short, records are usually single nouns, not pluralized. XRPC methods are usually in "verbNoun" form.


### Possible Future Changes

It is conceivable that NSID syntax would be relaxed to allow Unicode characters in the final segment.

The "glob" syntax variation may be modified to extended to make the distinction between single-level and nested matching more explicit.

The "fragment" syntax variation may be relaxed in the future to allow nested references.

No automated mechanism for verifying control of a "domain authority" currently exists. Also, not automated mechanism exists for fetching a lexicon schema for a given NSID, or for enumerating all NSIDs for a base domain. 
