---
title: Cryptography
summary: Cryptographic systems, curves, and key types used in AT Protocol
---

## Cryptography

Two elliptic curves are currently supported throughout the protocol, and implementations are expected to fully support both:

- `p256` elliptic curve: aka "NIST P-256", aka `secp256r1` (note the `r`), aka `prime256v1`
    - This curve *is* included in the WebCrypto API. It is commonly supported by personal device hardware (Trusted Platform Modules (TPMs) and mobile Secure Enclaves), and by cloud Hardware Security Modules (HSMs)
- `k256` elliptic curve: aka "NIST K-256", aka `secp256k1` (note the `k`)
    - This curve *is not* included in the WebCrypto API. It is used in Bitcoin and other cryptocurrencies, and as a result is broadly supported by personal secret key management technologies. It is also supported by cloud HSMs.

Because of the subtle visual distinction when the full curve names are written out, we often refer to them as `p256` or `k256`.

The atproto reference implementation from Bluesky supports both curves in all contexts, and creates `k256`  key pairs by default.

Key points for both systems have loss-less "compressed" representations, which are useful when sharing the public keys. This is usually supported natively for `k256`, but sometimes requires extra methods or jumping through hoops for `p256`. You can read more about this at: [02, 03 or 04? So What Are Compressed and Uncompressed Public Keys?](https://medium.com/asecuritysite-when-bob-met-alice/02-03-or-04-so-what-are-compressed-and-uncompressed-public-keys-6abcb57efeb6).

A common pattern when signing data in atproto is to encode the data in DAG-CBOR, hash the CBOR bytes with SHA-256, yielding raw bytes (not a hex-encoded string), and then sign the hash bytes.


### Possible Future Changes

The set of supported cryptographic systems is expected to evolve slowly. There are significant interoperability and implementation advantages to having as few systems as possible at any point in time.
