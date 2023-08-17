---
title: Cryptography
summary: Cryptographic systems, curves, and key types used in AT Protocol
---

# Cryptography

Two elliptic curves are currently supported throughout the protocol, and implementations are expected to fully support both:

- `p256` elliptic curve: aka "NIST P-256", aka `secp256r1` (note the `r`), aka `prime256v1`
    - This curve *is* included in the WebCrypto API. It is commonly supported by personal device hardware (Trusted Platform Modules (TPMs) and mobile Secure Enclaves), and by cloud Hardware Security Modules (HSMs)
- `k256` elliptic curve: aka "NIST K-256", aka `secp256k1` (note the `k`)
    - This curve *is not* included in the WebCrypto API. It is used in Bitcoin and other cryptocurrencies, and as a result is broadly supported by personal secret key management technologies. It is also supported by cloud HSMs.

Because of the subtle visual distinction when the full curve names are written out, we often refer to them as `p256` or `k256`.

The atproto reference implementation from Bluesky supports both curves in all contexts, and creates `k256`  key pairs by default.

Key points for both systems have loss-less "compressed" representations, which are useful when sharing the public keys. This is usually supported natively for `k256`, but sometimes requires extra methods or jumping through hoops for `p256`. You can read more about this at: [02, 03 or 04? So What Are Compressed and Uncompressed Public Keys?](https://medium.com/asecuritysite-when-bob-met-alice/02-03-or-04-so-what-are-compressed-and-uncompressed-public-keys-6abcb57efeb6).

A common pattern when signing data in atproto is to encode the data in DAG-CBOR, hash the CBOR bytes with SHA-256, yielding raw bytes (not a hex-encoded string), and then sign the hash bytes.


## ECDSA Signature Malleability

Some ECDSA signatures can be transformed to yield a new distinct but still-valid signature. This does not require access to the private signing key or the data that was signed. The scope of attacks possible using this property is limited, but it is an unexpected property.

For `k256` specifically, the distinction is between "low-S" and "high-S" signatures, as discussed in [Bitcoin BIP-0062](https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki).

In atproto, use of the "low-S" signature variant is required for both `p256` and `k256` curves.

In atproto, signatures should always be verified using the verification routines provided by the cryptographic library, never by comparing signature values as raw bytes.


## Public Key Encoding

When encoding public keys as strings, the preferred representation uses multibase (with `base58btc` specifically) and a multicode prefix to indicate the specific key type. By embedding metadata about the type of key in the encoding itself, they can be parsed unambiguously. The process for encoding a public key in this format is:

- Encode the public key curve "point" as bytes. Be sure to use the smaller "compact" or "compressed" representation. This is usually easy for `k256`, but might require a special argument or configuration for `p256` keys
- Prepend the appropriate curve multicodec value, as varint-encoded bytes, in front of the key bytes:
    - `p256` (compressed, 33 byte key length): `p256-pub`, code 0x1200, varint-encoded bytes: [0x80, 0x24]
    - `k256` (compressed, 33 byte key length): `secp256k1-pub`, code 0xE7, varint bytes: [0xE7, 0x01]
- Encode the combined bytes with with `base58btc`, and prefix with a `z` character, yielding a multibase-encoded string

The decoding process is the same in reverse, using the identified curve type as context.

To encode a key as a `did:key` identifier, use the above multibase encoding, and add the ASCII prefix `did:key:`. This identifier is used as an internal implementation detail in the DID PLC method.

Note that there is a variant legacy multibase encoding described in the [atproto DID specification document](/specs/did), which does not include a multicodec type value, and uses uncompressed byte encoding of keys. This format is deprecated.

### Encoded Examples

A P-256 public key, encoded in multibase (with multicodec), and as `did:key`:

```
zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo
did:key:zDnaembgSGUhZULN2Caob4HLJPaxBh92N7rtH21TErzqf8HQo
```

A K-256 public key, encoded in multibase (with multicodec), and as `did:key`:

```
zQ3shqwJEJyMBsBXCWyCBpUBMqxcon9oHB7mCvx4sSpMdLJwc
did:key:zQ3shqwJEJyMBsBXCWyCBpUBMqxcon9oHB7mCvx4sSpMdLJwc
```

## Usage and Implementation Guidelines

There is no specific recommended byte or string encoding for private keys across the atproto ecosystem. Sometimes simple hex encoding is used, sometimes multibase with or without multicodec type information.


## Possible Future Changes

The set of supported cryptographic systems is expected to evolve slowly. There are significant interoperability and implementation advantages to having as few systems as possible at any point in time.
