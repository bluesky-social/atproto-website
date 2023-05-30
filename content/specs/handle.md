---
title: Handle
summary: A specification for human-friendly account identifiers.
---

# Handle

DIDs are the long-term persistent identifiers for accounts in atproto, but they can be opaque and unfriendly for human use. Handles are a less-permanent identifier for accounts. The mechanism for verifying the link between an account handle and an account DID relies on DNS, and possibly connections to a network host, so every handle must be a valid network hostname. *Almost* every valid “hostname” is also a valid handle, though there are a small number of exceptions.

The definition “hostnames” (as a subset of all possible “DNS names”) has evolved over time and across several RFCs. Some relevant documents are [RFC-1035](https://www.rfc-editor.org/rfc/rfc1035), [RFC-3696](https://www.rfc-editor.org/rfc/rfc3696) section 2, and [RFC-3986](https://www.rfc-editor.org/rfc/rfc3986) section 3.

### Handle Syntax

Lexicon string type: `handle`

To synthesize other standards, and define “handle” syntax specifically:

- the overall handle must contain only ASCII characters, and can be at most 253 characters long (in practice, handles may be restricted to a slightly shorter length)
- the overall handle is split in to multiple segments (referred to as “labels” in standards documents), separated by ASCII periods (`.`)
- no proceeding or trailing ASCII periods are allowed, and there must be at least two segments. that is, ”bare” top-level domains are not allowed as handles, even if valid “hostnames” and “DNS names”. and “tailing dot” syntax for DNS names is not allowed for handles
- each segment must have at least 1 and at most 63 characters (not including the periods). the allowed characters are ASCII letters (`a-z`), digits (`0-9`), and hyphens (`-`)
- segments can not start or end with a hyphen.
- the last segment (the “top level domain”) can not start with a numeric digit
- handles are not case-sensitive, and should be normalized to lower-case (that is, normalize ASCII `A-Z` to `a-z`)

To be explicit (the above rules already specify this), no whitespace, null bytes, joining characters, or other ASCII control characters are allowed in the handle, including as prefix/suffix.

Modern “hostnames” (and thus handles) allow ASCII digits in most positions, with the exception that the last segment (top-level domain, TLD) can not start with a digit.

IP addresses are not valid syntax: IPv4 addresses have a final segment starting with a digit, and IPv6 addresses are separated by colons (`:`).

A reference regular expression (regex) for the handle syntax is:

```
/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
```

### Additional Non-Syntax Restrictions

“Reserved” top-level domains should not fail syntax validation (eg, in atproto Lexicon validation), but they must immediately fail any attempt at registration, resolution, etc. See also: [https://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains](https://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains)

`.local` hostnames (for mDNS on local networks) should not be used in atproto.

The `.onion` TLD is a special case for Tor protocol hidden services. Resolution of handles via Tor would require ecosystem-wide support, so they are currently disallowed.

To summarize the above, the initial list of disallowed TLDs includes:

- `.local`
- `.arpa`
- `.invalid`
- `.localhost`
- `.internal`
- `.onion`

The `.test` TLD is intended for examples, testing, and development. It may be used in atproto development, but should fail in real-world environments.

### Examples

Syntactically valid handles (which may or may not have existing TLDs): 

```
jay.bsky.social
8.cn
name.t--t        // not a real TLD, but syntax ok
XX.LCS.MIT.EDU
a.co
xn--notarealidn.com
xn--fiqa61au8b7zsevnm8ak20mc4a87e.xn--fiqs8s
xn--ls8h.test
example.t        // not a real TLD, but syntax ok
```

Invalid syntax:

```
jo@hn.test
💩.test
john..test
xn--bcher-.tld
john.0
cn.8
www.masełkowski.pl.com
org
name.org.
```

Valid syntax, but must always fail resolution due to other restrictions:

```
2gzyxa5ihm7nsggfxnu52rck2vv4rvmdlkiu3zzui5du4xyclen53wid.onion
laptop.local
blah.arpa
```

### Usage and Implementation Guidelines

Handles may be prefixed with the “at” symbol (like `@jay.bsky.team`) in user interfaces, but this is not a valid syntax for a handle in records, APIs, and other back-end contexts.

Internationalized Domain Names (”IDN”, or “punycode”) are not directly relevant to the low-level handle syntax. In their encoded form, IDNs are already valid hostnames, and thus valid handles. Such handles must be stored and transmitted in encoded ASCII form. Handles that “look like” IDNs, but do not parse as valid IDNs, are valid handles, just as they are valid hostnames. Applications may, optionally, parse and display IDN handles as Unicode.

Handles are not case-sensitive, which means they can be safely normalized from user input to lower-case (ASCII) form. Only normalized (lower-case) handles should be stored in records or used in outbound API calls. Applications should not preserve user-provided case information and attempt to display handles in anything other than lower-case. For example, the handle input string `BlueskyWeb.xyz`  should be normalized, stored, and displayed as `blueskyweb.xyz`.

Very long handles are known to present user interface challenges, but they are allowed in the protocol, and application developers are expected to support them.

Handles which look similar to a well-known domain present security and impersonation challenges. For example, handles like `paypa1.com` or `paypal.cc` being confused for `paypal.com`. Very long handles can result in similar issues when truncated at the start or end (`paypal.com…`).

Handles should generally not be truncated to local context. For example, the handle `@jay.bsky.social` should not be displayed as `@jay`, even in the local context of a `bsky.social` service.

Providers of handle “namespaces” (eg, as subdomains on a registered domain) may impose any additional limits on handles that they wish. It is recommended to constrain the allowed segment length to something reasonable, and to reserve a common set of segment strings like `www`, `admin`, `mail`, etc. There are multiple public lists of “commonly disallowed usernames” that can be used as a starting point.

From a practical standpoint, handles should be limited to at most 244 characters, fewer than the 253 allowed for DNS names. This is because DNS verification works with the prefix `_atproto.`, which adds 9 characters, and that overall name needs to be valid.

Handle hostnames are expected to be mainstream DNS domain names, registered through the mainstream DNS name system. Handles with non-standard TLDs, or using non-standard naming systems, will fail to interoperate with other network services and protocol implementations in the atproto ecosystem.

### Possible Future Changes

The handle syntax is relatively stable.

It is conceivable that `.onion` handles would be allowed at some point in the future.
