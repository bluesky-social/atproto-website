---
title: Identity
summary: How the AT Protocol handles user identity.
tldr:
  - Every user has a domain name handle like alice.host.com or just alice.com
  - Every user also has a persistent "DID" which enables migration between hosts
  - The DID maps to users' keys and current host addresses
---

# Identity

The atproto identity system has a number of requirements:

* **ID provision.** Users should be able to create global IDs which are stable across services. These IDs should rarely change to ensure that links to their content are stable.
* **Public key distribution.** Distributed systems rely on cryptography to prove the authenticity of data and provide end-to-end privacy. The identity system must publish their public keys with strong security.
* **Key rotation.** Users must be able to rotate their key material without disrupting their identity.
* **Service discovery.** To interact with users, applications must be able to discover the services in use by a given user.
* **Usability.** Users should have human-readable and memorable names.
* **Portability.** Identities should be portable across services. Changing a provider should not cause a user to lose their identity, social graph, or content.

Adopting this system should give applications the tools for end-to-end encryption, signed user data, service sign in, and general interoperation.

## Identifiers

We use two interrelated forms of identifiers: the _handle_ and the _DID_. Handles are DNS names while DIDs are an [emerging W3C standard](https://www.w3.org/TR/did-core/) which act as secure & stable IDs.

The following are all valid user identifiers:

<pre><code>alice.host.com
at://alice.host.com
at://did:plc:bv6ggog3tya2z3vxsub7hnal
</code></pre>

The relationship between them can be visualized as:

<pre style="line-height: 1.2;"><code>┌──────────────────┐                 ┌───────────────┐ 
│ DNS name         ├──resolves to──→ │ DID           │
│ (alice.host.com) │                 │ (did:plc:...) │
└──────────────────┘                 └─────┬─────────┘
       ↑                                   │
       │                               resolves to
       │                                   │
       │                                   ↓
       │                            ┌───────────────┐ 
       └───────────references───────┤ DID Document  │
                                    │ {"id":"..."}  │
                                    └───────────────┘
</code></pre>

The DNS handle is a user-facing identifier — it should be shown in UIs and promoted as a way to find users. Applications resolve handles to DIDs and then use the DID as the stable canonical identifier. The DID can then be securely resolved to a DID document which includes public keys and user services.

<table>
  <tr>
   <td><strong>Handles</strong>
   </td>
   <td>Handles are DNS names. They are resolved using the <a href="/lexicons/com-atproto-identity">com.atproto.identity.resolveHandle()</a> XRPC method and should be confirmed by a matching entry in the DID document. Details in the [Handle specification](/specs/handle).
   </td>
  </tr>
  <tr>
   <td><strong>DIDs</strong>
   </td>
   <td>DIDs are an emerging <a href="https://www.w3.org/TR/did-core/">W3C standard</a> for providing stable & secure IDs. They are used as stable, canonical IDs of users. Details of how they are used in AT Protocol in the [DID specification](/specs/did).
   </td>
  </tr>
  <tr>
   <td><strong>DID Documents</strong>
   </td>
   <td>
    DID Documents are standardized objects which are hosted by DID registries. They include the following information:
    <ul>
      <li>The handle associated with the DID.</li>
      <li>The signing key.</li>
      <li>The URL of the user’s PDS.</li>
    </ul>
   </td>
  </tr>
</table>

## DID Methods

The [DID standard](https://www.w3.org/TR/did-core/) supports custom "methods" of publishing and resolving DIDs to the [DID Document](https://www.w3.org/TR/did-core/#core-properties). A variety of existing methods [have been published](https://w3c.github.io/did-spec-registries/#did-methods) so we must establish criteria for inclusion in this proposal:

- **Strong consistency.** For a given DID, a resolution query should produce only one valid document at any time. (In some networks, this may be subject to probabilistic transaction finality.)
- **High availability**. Resolution queries must succeed reliably.
- **Online API**. Clients must be able to publish new DID documents through a standard API.
- **Secure**. The network must protect against attacks from its operators, a MITM, and other users.
- **Low cost**. Creating and updating DID documents must be affordable to services and users.
- **Key rotation**. Users must be able to rotate keypairs without losing their identity.
- **Decentralized governance**. The network should not be governed by a single stakeholder; it must be an open network or a consortium of providers.

At present, none of the DID methods meet our standards fully. **Therefore, we have chosen to support [did-web](https://w3c-ccg.github.io/did-method-web/) and a temporary method we've created called [DID Placeholder](https://github.com/bluesky-social/did-method-plc).** We expect this situation to evolve as new solutions emerge.

## Handle Resolution

Handles in atproto are domain names which resolve to a DID, which in turn resolves to a DID Document containing the user's signing pubkey and hosting service.

Handle resolution uses the [`com.atproto.identity.resolveHandle`](/lexicons/com-atproto-identity) XRPC method. The method call should be sent to the server identified by the handle, and the handle should be passed as a parameter.

Here is the algorithm in pseudo-TypeScript:

```typescript
async function resolveHandle(handle: string) {
  const origin = `https://${handle}`
  const res = await xrpc(origin, 'com.atproto.identity.resolveHandle', {handle})
  assert(typeof res?.did === 'string' && res.did.startsWith('did:'))
  return res.did
}
```

### Example: Hosting service

Consider a scenario where a hosting service is using PLC and is providing the handle for the user as a subdomain:

- The handle: `alice.pds.com`
- The DID: `did:plc:12345`
- The hosting service: `https://pds.com`

At first, all we know is `alice.pds.com`, so we call `com.atproto.identity.resolveHandle()` on `alice.pds.com`. This tells us the DID.

```typescript
await xrpc.service('https://alice.pds.com').com.atproto.identity.resolveHandle() // => {did: 'did:plc:12345'}
```

Next we call the PLC resolution method on the returned DID so that we can learn the hosting service's endpoint and the user's key material.

```typescript
await didPlc.resolve('did:plc:12345') /* => {
  id: 'did:plc:12345',
  alsoKnownAs: `https://alice.pds.com`,
  verificationMethod: [...],
  service: [{serviceEndpoint: 'https://pds.com', ...}]
}*/
```

We can now communicate with `https://pds.com` to access Alice's data.

### Example: Hosting service with separate domain name

Suppose we have the same scenario as before, except the user has supplied their own domain name:

- The handle: `alice.com` (this differs from before)
- The DID: `did:plc:12345`
- The hosting service: `https://pds.com`

We call `com.atproto.identity.resolveHandle()` on `alice.com` to get the DID.

```typescript
await xrpc.service('https://alice.com').com.atproto.identity.resolveHandle() // => {did: 'did:plc:12345'}
```

Then we resolve the DID as before:

```typescript
await didPlc.resolve('did:plc:12345') /* => {
  id: 'did:plc:12345',
  alsoKnownAs: `https://alice.com`,
  verificationMethod: [...],
  service: [{serviceEndpoint: 'https://pds.com', ...}]
}*/
```

We can now communicate with `https://pds.com` to access Alice's data. The `https://alice.com` endpoint only serves to handle the `com.atproto.identity.resolveHandle()` call. The actual user data lives on `pds.com`.

### Example: Self-hosted

Let's consider a self-hosting scenario. If it's using did:plc, it would look something like:

- The handle: `alice.com`
- The DID: `did:plc:12345`
- The hosting service: `https://alice.com`

However, **if the self-hoster is confident they will retain ownership of the domain name**, they can use did:web instead of did:plc:

- The handle: `alice.com`
- The DID: `did:web:alice.com`
- The hosting service: `https://alice.com`

We call `com.atproto.identity.resolveHandle()` on `alice.com` to get the DID.

```typescript
await xrpc.service('https://alice.com').com.atproto.identity.resolveHandle() // => {did: 'did:web:alice.com'}
```

We then resolve using did:web:

```typescript
await didWeb.resolve('did:web:alice.com') /* => {
  id: 'did:web:alice.com',
  alsoKnownAs: `https://alice.com`,
  verificationMethod: [...],
  service: [{serviceEndpoint: 'https://alice.com', ...}]
}*/
```
