---
title: DID
summary: Persistent decentralized identifiers (as used in atproto)
---

# AT Protocol DIDs

The AT Protocol uses [Decentralized Identifiers](https://en.wikipedia.org/wiki/Decentralized_identifier) (DIDs) as persistent, long-term account identifiers. DID is a W3C standard, with many standardized and proposed DID method implementations.


### Blessed DID Methods

Currently, atproto supports two DID methods:

- `did:web`, which is a W3C standard based on HTTPS (and DNS). The identifier section is a hostname. This method is supported in atproto to provide an independent alternative to `did:plc`. The method is inherently tied to the domain name used, and does not provide a mechanism for migration or recovering from loss of control of the domain name. In the context of atproto, only hostname-level `did:web` DIDs are supported: path-based DIDs are not supported. The same restrictions on top-level domains that apply to handles (eg, no `.arpa`) also apply to `did:web` domains. The special `[localhost](http://localhost)` hostname is allowed, but only in testing and development environments. Port numbers (with separating colon hex-encoded) are only allowed for `localhost`, and only in testing and development.
- `did:plc`, which is a novel DID method developed by Bluesky. See the [did-method-plc](https://github.com/bluesky-social/did-method-plc) GitHub repository for details. Even though this method is referred to as "placeholder", it will be supported indefinitely.

In the future, a small number of additional methods may be supported. It is not the intention to support all or even many DID methods, even with the existence of universal resolver software.


### AT Protocol DID Syntax

Lexicon string type: `did`

The DID Core specification constraints on DID identifier syntax, regardless of the method used. A summary of those syntax constraints, which may be used to validate DID generically in atproto are:

- The entire URI is made up of a subset of ASCII, containing letters (`A-Z`, `a-z`), digits (`0-9`), period, underscore, colon, percent sign, or hyphen (`._:%-`)
- The URI is case-sensitive
- The URI starts with lowercase `did:`
- The method segment is one or more lowercase letters (`a-z`), followed by `:`
- The remainder of the URI (the identifier) may contain any of the above-allowed ASCII characters, except for percent-sign (`%`)
- The URI (and thus the remaining identifier) may not end in `:`.
- Percent-sign (`%`) is used for "percent encoding" in the identifier section, and must always be followed by two hex characters
- Query (`?`) and fragment (`#`) sections are allowed in DID URIs, but not in DID identifiers. In the context of atproto, the query and fragment parts are not allowed.

DID identifiers do not generally have a maximum length restriction, but in the context of atproto, there is an initial hard limit of 2 KB.

In the context of atproto, implementations do not need to validate percent encoding. The percent symbol is allowed in DID identifier segments, but the identifier should not end in a percent symbol. A DID containing invalid percent encoding *should* fail any attempt at registration, resolution, etc.

A reasonable starting-point regex for DIDs in the context of atproto is:

```
// NOTE: does not constrain overall length
/^did:[a-z]+:[a-zA-Z0-9._:%-]*[a-zA-Z0-9._-]$/
```


### Examples

Valid DIDs for use in atproto (correct syntax, and supported method):

```
did:plc:z72i7hdynmk6r22z27h6tvur
did:web:blueskyweb.xyz
```

Valid DID syntax (would pass Lexicon syntax validation), but unsupported DID method:

```
did:method:val:two
did:m:v
did:method::::val
did:method:-:_:.
did:key:zQ3shZc2QzApp2oymGvQbzP8eKheVshBHbU4ZYjeXqwSKEn6N
```

Invalid DID identifier syntax (regardless of DID method):

```
did:METHOD:val
did:m123:val
DID:method:val
did:method:
did:method:val/two
did:method:val?two
did:method:val#two
```


### Usage and Implementation Guidelines

Protocol implementations should be flexible to processing content containing DIDs based on unsupported DID methods. This is important to allow gradual evolution of the protocol ecosystem over time. In other words, implementations should distinguish between at least the distinct cases "invalid DID syntax", "unsupported DID method" and "supported DID method, but specific DID resolution failed".

While longer DIDs are supported in the protocol, a good best practice is to use relatively short DIDs, and to avoid DIDs longer than 64 characters.

DIDs are case-sensitive. While the currently-supported methods are *not* case sensitive, and could be safely lowercased, protocol implementations should reject DIDs with invalid casing. It is permissible to attempt case normalization when receiving user-controlled input, such as when parsing public URL path components, or text input fields.


### Possible Future Changes

The hard maximum DID length limit may be reduced, at the protocol level. We are not aware of any DID methods that we would consider supporting which have identifiers longer than, say, 256 characters.

There is a good chance that the set of "blessed" DID methods will slowly expand over time.
