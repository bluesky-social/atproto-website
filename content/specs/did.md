---
title: DID
summary: Persistent decentralized identifiers (as used in atproto)
---

# AT Protocol DIDs

The AT Protocol uses [Decentralized Identifiers](https://en.wikipedia.org/wiki/Decentralized_identifier) (DIDs) as persistent, long-term account identifiers. DID is a W3C standard, with many standardized and proposed DID method implementations.


## Blessed DID Methods

Currently, atproto supports two DID methods:

- `did:web`, which is a W3C standard based on HTTPS (and DNS). The identifier section is a hostname. This method is supported in atproto to provide an independent alternative to `did:plc`. The method is inherently tied to the domain name used, and does not provide a mechanism for migration or recovering from loss of control of the domain name. In the context of atproto, only hostname-level `did:web` DIDs are supported: path-based DIDs are not supported. The same restrictions on top-level domains that apply to handles (eg, no `.arpa`) also apply to `did:web` domains. The special `localhost` hostname is allowed, but only in testing and development environments. Port numbers (with separating colon hex-encoded) are only allowed for `localhost`, and only in testing and development.
- `did:plc`, which is a novel DID method developed by Bluesky. See the [did-method-plc](https://github.com/bluesky-social/did-method-plc) GitHub repository for details. Even though this method is referred to as "placeholder", it will be supported indefinitely.

In the future, a small number of additional methods may be supported. It is not the intention to support all or even many DID methods, even with the existence of universal resolver software.


## AT Protocol DID Identifier Syntax

Lexicon string format type: `did`

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

## DID Documents

After a DID document has been resolved, atproto-specific information needs to be extracted. This parsing process is agnostic to the DID method used to resolve the document.

The current **handle** for the DID is found in the `alsoKnownAs` array. Each element of this array is a URI. Handles will have the URI scheme `at://`, followed by the handle, with no path or other URI parts. The current primary handle is the first valid handle URI found in the ordered list. Any other handle URIs should be ignored.

It is crucial to validate the handle bidirectionally, by resolving the handle to a DID and checking that it matches the current DID document.

The DID is the primary account identifier, and an account whose DID document does not contain a valid and confirmed handle can still, in theory, participate in the atproto ecosystem. Software should be careful to either not display any handle for such account, or obviously indicate that any handle associated with it is invalid.

The public **signing key** for the account is found under the `verificationMethod` array, in an object with `id` matching `#atproto`, and the `controller` matching the DID itself. The first valid atproto signing key in the array should be used, and any others ignored. The `type` field will indicate the cryptographic curve type, and the `publicKeyMultibase` field will be the public key in multibase encoding. See below for details for parsing these fields.

A valid signing key is required for atproto functionality, and an account with no valid key in their DID document is broken.

The **PDS service network location** for the account is found under the `service` array, with `id` matching `#atproto_pds`, and `type` matching `AtprotoPersonalDataServer`. The first matching entry in the array should be used, and any others ignored. The `serviceEndpoint` field must contain an HTTPS URL of server. It should contain only the URI scheme (`http` or `https`), hostname, and optional port number, not any "userinfo", path prefix, or other components.

A working PDS is required for atproto account functionality, and an account with no valid PDS location in their DID document is broken.

Note that a valid URL doesn't mean the the PDS itself is currently functional or hosting content for the account. During account migrations or server downtime there may be windows when the PDS is not accessible, but this does not mean the account should immediately be considered broken or invalid.


## Representation of Public Keys

The atproto cryptographic systems are described in [Cryptography](/specs/crypto), including details of byte and string encoding of public keys.

Public keys in DID documents under `verificationMethod`, including atproto signing keys, are represented as an object with the following fields:

- `id` (string, required): the DID followed by an identifying fragment. Use `#atproto` as the fragment for atproto signing keys
- `type` (string, required): the fixed string `Multikey`
- `controller` (string, required): DID controlling the key, which in the current version of atproto must match the account DID itself
- `publicKeyMultibase` (string, required): the public key itself, encoded in multibase format (with multicodec type indicator, and "compressed" key bytes)

The `publicKeyMultibase` format for `Multikey` is the same encoding scheme as used with `did:key`, but without the `did:key:` prefix. See [Cryptography](/specs/crypto) for details.

Note that there is not yet a formal W3C standard for using P-256 public keys in DID `verificationMethod` sections, but that the `Multikey` standard does clarify what the encoding encoding should be for this key type.


### Legacy Representation

Some older DID documents, which may still appear in `did:web` docs, had slightly different key encodings and `verificationMethod` syntax. Implementations may support these older DID documents during a transition period, but the intentent is to require DID specification compliance going forward.

The older `verificationMethod` for atproto signing keys contained:

- `id` (string, required): the DID followed by an identifying fragment. Use `#atproto` as the fragment for atproto signing keys
- `type` (string, required): a fixed name identifying the key's curve type
    - `p256`: `EcdsaSecp256r1VerificationKey2019` (note the "r")
    - `k256`: `EcdsaSecp256k1VerificationKey2019` (note the "k")
- `controller` (string, required): DID controlling the key, which in the current version of atproto must match the account DID itself
- `publicKeyMultibase` (string, required): the public key itself, encoded in multibase format (*without* multicodec, and *uncompressed* key bytes)

Note that the `EcdsaSecp256r1VerificationKey2019` type is not a final W3C standard.

The `EcdsaSecp256r1VerificationKey2019` `verificationMethod` is not a final W3C standard. We will move to whatever ends up standardized by W3C for representing P-256 public keys with `publicKeyMultibase`. This may mean a transition to `Multikey`, and we would transition K-256 representations to that `type` as well.

A summary of the multibase encoding in this context:

- Start with the full public key bytes. Do not use the "compressed" or "compact" representation (unlike for `did:key` or `Multikey` encoding)
- Do *not* prefix with a multicodec value indicating the key type
- Encode the key bytes with `base58btc`, yielding a string
- Add the character `z` as a prefix, to indicate the multibase, and include no other multicodec indicators

The decoding process is the same in reverse, using the curve type as context.

Here is an example of a single public key encoded in the legacy and current formats:

```
// legacy multibase encoding of K-256 public key
{
    "id": ...,
    "controller": ...,
    "type": "EcdsaSecp256k1VerificationKey2019",
    "publicKeyMultibase": "zQYEBzXeuTM9UR3rfvNag6L3RNAs5pQZyYPsomTsgQhsxLdEgCrPTLgFna8yqCnxPpNT7DBk6Ym3dgPKNu86vt9GR"
}

// preferred multibase encoding of same K-256 public key
{
    "id": ...,
    "controller": ...,
    "type": "Multikey",
    "publicKeyMultibase": "zQ3shXjHeiBuRCKmM36cuYnm7YEMzhGnCmCyW92sRJ9pribSF"
}
```


## Usage and Implementation Guidelines

Protocol implementations should be flexible to processing content containing DIDs based on unsupported DID methods. This is important to allow gradual evolution of the protocol ecosystem over time. In other words, implementations should distinguish between at least the distinct cases "invalid DID syntax", "unsupported DID method" and "supported DID method, but specific DID resolution failed".

While longer DIDs are supported in the protocol, a good best practice is to use relatively short DIDs, and to avoid DIDs longer than 64 characters.

DIDs are case-sensitive. While the currently-supported methods are *not* case sensitive, and could be safely lowercased, protocol implementations should reject DIDs with invalid casing. It is permissible to attempt case normalization when receiving user-controlled input, such as when parsing public URL path components, or text input fields.

## Possible Future Changes

The hard maximum DID length limit may be reduced, at the protocol syntax level. We are not aware of any DID methods that we would consider supporting which have identifiers longer than, say, 256 characters.

There is a good chance that the set of "blessed" DID methods will slowly expand over time.
