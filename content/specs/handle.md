---
title: Handle
summary: A specification for human-friendly account identifiers.
---

# Handle

DIDs are the long-term persistent identifiers for accounts in atproto, but they can be opaque and unfriendly for human use. Handles are a less-permanent identifier for accounts. The mechanism for verifying the link between an account handle and an account DID relies on DNS, and possibly connections to a network host, so every handle must be a valid network hostname. *Almost* every valid "hostname" is also a valid handle, though there are a small number of exceptions.

The definition "hostnames" (as a subset of all possible "DNS names") has evolved over time and across several RFCs. Some relevant documents are [RFC-1035](https://www.rfc-editor.org/rfc/rfc1035), [RFC-3696](https://www.rfc-editor.org/rfc/rfc3696) section 2, and [RFC-3986](https://www.rfc-editor.org/rfc/rfc3986) section 3.

## Handle Identifier Syntax

Lexicon string format type: `handle`

To synthesize other standards, and define "handle" syntax specifically:

- The overall handle must contain only ASCII characters, and can be at most 253 characters long (in practice, handles may be restricted to a slightly shorter length)
- The overall handle is split in to multiple segments (referred to as "labels" in standards documents), separated by ASCII periods (`.`)
- No proceeding or trailing ASCII periods are allowed, and there must be at least two segments. That is, "bare" top-level domains are not allowed as handles, even if valid "hostnames" and "DNS names." "Tailing dot" syntax for DNS names is not allowed for handles.
- Each segment must have at least 1 and at most 63 characters (not including the periods). The allowed characters are ASCII letters (`a-z`), digits (`0-9`), and hyphens (`-`).
- Segments can not start or end with a hyphen
- The last segment (the "top level domain") can not start with a numeric digit
- Handles are not case-sensitive, and should be normalized to lowercase (that is, normalize ASCII `A-Z` to `a-z`)

To be explicit (the above rules already specify this), no whitespace, null bytes, joining characters, or other ASCII control characters are allowed in the handle, including as prefix/suffix.

Modern "hostnames" (and thus handles) allow ASCII digits in most positions, with the exception that the last segment (top-level domain, TLD) cannot start with a digit.

IP addresses are not valid syntax: IPv4 addresses have a final segment starting with a digit, and IPv6 addresses are separated by colons (`:`).

A reference regular expression (regex) for the handle syntax is:

```
/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/
```

## Additional Non-Syntax Restrictions

"Reserved" top-level domains should not fail syntax validation (eg, in atproto Lexicon validation), but they must immediately fail any attempt at registration, resolution, etc. See also: [https://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains](https://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains)

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

## Identifier Examples

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

## Handle Resolution

Handles have a limited role in atproto, and need to be resolved to a DID in almost all situations. Resolution mechanisms must demonstrate a reasonable degree of authority over the domain name at a point in time, and need to be relatively efficient to look up. There are currently two supported resolution mechanisms, one using a TXT DNS record containing the DID, and another over HTTPS at a special `/.well-known/` URL.

Clients can rely on network services (eg, their PDS) to resolve handles for them, using the `com.atproto.identity.resolveHandle` endpoint, and don't usually need to implement resolution directly themselves.

The DNS TXT method is the recommended and preferred resolution method for individual handle configuration, but services should fully support both methods. The intended use-case for the HTTPS method is existing large-scale web services which may not have the infrastructure to automate the registration of thousands or millions of DNS TXT records.

Handles should not be trusted or considered valid until the DID is also resolved and the current DID document is confirmed to link back to the handle. The link between handle and DID must be confirmed bidirectionally, otherwise anybody could create handle aliases for third-party accounts.

### DNS TXT Method

For this resolution method, a DNS TXT record is registered for the `_atproto` sub-domain under the handle hostname. The record value should have the prefix `did=`, followed by the full domain. This method aligns with [RFC-1464](https://www.rfc-editor.org/rfc/rfc1464.html), "Using the Domain Name System To Store Arbitrary String Attributes".

For example, the handle `bsky.app` would have a TXT record on the name `_atproto.bsky.app`, and the value would look like `did=did:plc:z72i7hdynmk6r22z27h6tvur`.

Any TXT records with values not starting with `did=` should be ignored. Only a single valid record should exist at any point in time. If multiple valid records with different DIDs are present, resolution should fail. In this case resolution can be re-tried after a delay, or using a recursive resolver.

Note that very long handles can not be resolved using this method if the additional `_atproto.` name segment pushes the overall name over the 253 character maximum for DNS queries. The HTTPS method will work for such handles.

DNSSEC is not required.

### HTTPS well-known Method

For this resolution method, a web server at the handle domain implements a special well-known endpoint at the path `/.well-known/atproto-did`. A valid HTTP response will have an HTTP success status (2xx), `Content-Type` header set to `text/plain`, and include the DID as the HTTP body with no prefix or wrapper formatting.

For example, the handle `bsky.app` would be resolved by an GET request to `https://bsky.app/.well-known/atproto-did`, and a valid response would look like:

```
HTTP/1.1 200 OK
Content-Length: 33
Content-Type: text/plain
Date: Wed, 14 Jun 2023 00:47:21 GMT

did:plc:z72i7hdynmk6r22z27h6tvur

```

The response `Content-Type` header does not need to be strictly verified.

It is acceptable to strip any prefix and suffix whitespace from the response body before attempting to parse as a DID.

Secure HTTPS on the default port (443) is required for all real-world handle resolutions. HTTP should only be used for local development and testing.

HTTP redirects (eg, 301, 302) are allowed, up to a reasonable number of redirect hops.

### Resolution Best Practices

It is ok to attempt both resolution methods in parallel, and to use the first successful result available. If the two methods return conflicting results (aka, different DIDs), the DNS TXT result should be preferred, though it is also acceptable to record the result as ambiguous and try again later.

It is considered a best practice for services to cache handle resolution results internally, up to some lifetime, and re-resolve periodically. DNS TTL values provide a possible cache lifetime, but are probably too aggressive (aka, too short a lifetime) for the handle resolution use case.

Use of a recursive DNS resolver can help with propagation delays, which are important for the use case of an account changing their handle and waiting for confirmation.

With both techniques, it is beneficial to initiate resolution requests from a relatively trusted network environment and configuration. Running resolution requests from multiple regions and environments can help mitigate (though not fully resolve) concerns about traffic manipulation or intentionally segmented responses.


## Usage and Implementation Guidelines

Handles may be prefixed with the "at" symbol (like `@jay.bsky.team`) in user interfaces, but this is not a valid syntax for a handle in records, APIs, and other back-end contexts.

Internationalized Domain Names ("IDN", or "punycode") are not directly relevant to the low-level handle syntax. In their encoded form, IDNs are already valid hostnames, and thus valid handles. Such handles must be stored and transmitted in encoded ASCII form. Handles that "look like" IDNs, but do not parse as valid IDNs, are valid handles, just as they are valid hostnames. Applications may, optionally, parse and display IDN handles as Unicode.

Handles are not case-sensitive, which means they can be safely normalized from user input to lower-case (ASCII) form. Only normalized (lowercase) handles should be stored in records or used in outbound API calls. Applications should not preserve user-provided case information and attempt to display handles in anything other than lower-case. For example, the handle input string `BlueskyWeb.xyz`  should be normalized, stored, and displayed as `blueskyweb.xyz`. Long all-lowercase handles can be a readability and accessibility challenge. Sub-domain separation (periods), hyphenation, or use of "display names" in application protocols can all help.

Very long handles are known to present user interface challenges, but they are allowed in the protocol, and application developers are expected to support them.

Handles which look similar to a well-known domain present security and impersonation challenges. For example, handles like `paypa1.com` or `paypal.cc` being confused for `paypal.com`. Very long handles can result in similar issues when truncated at the start or end (`paypal.com…`).

Handles should generally not be truncated to local context. For example, the handle `@jay.bsky.social` should not be displayed as `@jay`, even in the local context of a `bsky.social` service.

Providers of handle "namespaces" (eg, as subdomains on a registered domain) may impose any additional limits on handles that they wish. It is recommended to constrain the allowed segment length to something reasonable, and to reserve a common set of segment strings like `www`, `admin`, `mail`, etc. There are multiple public lists of "commonly disallowed usernames" that can be used as a starting point.

From a practical standpoint, handles should be limited to at most 244 characters, fewer than the 253 allowed for DNS names. This is because DNS verification works with the prefix `_atproto.`, which adds 9 characters, and that overall name needs to be valid.

Handle hostnames are expected to be mainstream DNS domain names, registered through the mainstream DNS name system. Handles with non-standard TLDs, or using non-standard naming systems, will fail to interoperate with other network services and protocol implementations in the atproto ecosystem.

## Possible Future Changes

The handle syntax is relatively stable.

It is conceivable that `.onion` handles would be allowed at some point in the future.
