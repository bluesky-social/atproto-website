---
title: Identity
summary: How the at:// protocol handles user identity.
---

# Identity

The identity system has a number of requirements:

* **ID Provision.** Users should be able to create global IDs which are stable across services. These IDs should rarely change to ensure that links to their content are stable.
* **Public key distribution.** Distributed systems rely on cryptography to prove the authenticity of data and provide end-to-end privacy. The identity system must publish their public keys with strong security.
* **Service discovery.** To interact with users, applications must be able to discover the services in use by a given user.
* **Usability.** Users should have human-readable and memorable names.
* **Portability.** Identities should be portable across services. Changing a provider should not cause a user to lose their identity, social graph, or content

Adopting this system should give applications the tools for end-to-end encryption, signed user data, service sign in, and general interoperation.

## Identifiers

We use two interrelated forms of identifiers: the _username_ and the _DID_. Usernames are email-like IDs which are resolved using [Webfinger](https://webfinger.net/) while DIDs are an [emerging W3C standard](https://www.w3.org/TR/did-core/) which act as secure & stable IDs.

![Username & DID diagram](/img/overview/username-did-diagram.png)

The email-style username is a user-facing identifier — it should be shown in UIs and promoted as a way to find users. Applications resolve usernames to DIDs and then use the DID as the stable canonical identifier. The DID can then be securely resolved to a DID document which includes public keys and user services.

<table>
  <tr>
   <td><strong>Usernames</strong>
   </td>
   <td>Usernames are email-style (user@domain). They are resolved to DIDs using the <a href="https://webfinger.net/">Webfinger</a> protocol and must be confirmed by a matching entry in the DID document.
<p>
By using Webfinger, the allocation and management of usernames are delegated to DNS (for the part after the @) and the admins of the Webfinger HTTP endpoints (for the part before the @).
   </td>
  </tr>
  <tr>
   <td><strong>DIDs</strong>
   </td>
   <td>DIDs are an emerging<a href="https://www.w3.org/TR/did-core/"> W3C standard</a> for providing stable & secure IDs. They are used as stable, canonical IDs of users.
<p>
The DID syntax supports a variety of “DID methods” that define how the DID is published and modified. This document proposes creating a new method which is operated by a consortium of providers.
   </td>
  </tr>
  <tr>
   <td><strong>DID Documents</strong>
   </td>
   <td>DID Documents are standardized objects which are hosted by DID registries. They include the following information:
<ul>

<li>The username associated with the DID

<li>User public-key material

<li>Pointers to the user’s services

<p>
DID Documents provide all the information necessary for a client to begin interacting with a given user and their content.
</li>
</ul>
   </td>
  </tr>
</table>

## DID Methods

The [DID standard](https://www.w3.org/TR/did-core/) supports custom "methods" of publishing and resolving DIDs to the [DID Document](https://www.w3.org/TR/did-core/#core-properties). A variety of existing methods [have been published](https://w3c.github.io/did-spec-registries/#did-methods) so we must establish criteria for fitness in this proposal:

- **Strong consistency.** For a given DID, a resolution query should produce only one valid document at any time. (In some networks, this may be subject to probabilistic transaction finality.)
- **High availability**. Resolution queries must succeed reliably.
- **Online API**. Clients must be able to publish new DID documents through a standard API.
- **Secure**. The network must protect against attacks from its operators, a MITM, and other users.
- **Low cost**. Creating and updating DID documents must be affordable to services and users.
- **Key rotation**. Users must be able to rotate keypairs without losing their identity.
- **Decentralized governance**. The network should not be governed by a single stakeholder; it must be an open network or a consortium of providers.

Many existing DID networks are permissionless blockchains which achieve the above goals but with relatively poor latency ([ION](https://identity.foundation/ion/) takes roughly 20 minutes for commitment finality). Other methods such as "did:web" may be ideal for self-hosting users but lack an online API and so must be iterated upon to meet our requirements.

While we believe supporting the existing methods which meet these criteria is a good idea, we also believe a better approach can be provided by building a new DID Consortium registry.

## The DID Consortium

The (currently-unnamed) DID Consortium will securely host user IDs. It will be operated by multiple different organizations who share ownership of the service.

![Consortium diagram](/img/overview/consortium-diagram.png)

The design of the consortium software is still under development, but the current thinking follows the above diagram. Consortium members will operate nodes which coordinate under a control plane run by the consortium governance. They will coordinate reads and writes to a secure append-only log which can be monitored externally, through a technique similar to [Certificate Transparency](https://certificate.transparency.dev/).

Clients (users) will submit reads and writes to members of the consortium. External auditors will be able to follow the log to watch for unexpected identity changes and ensure the consortium is operating as intended.

## Consortium ID format and data model

DID Documents published to the Consortium will be identified by a hash of the initial document (known as the "genesis" document). This genesis doc includes the public key for a primary keypair which signs the genesis doc and any subsequent updates. Updates can change the primary public key, in which case subsequent updates to the document should be signed by the new keypair. A recovery keypair may also be included in the document with superseding capacity to sign updates.

To correctly host a DID Document and its changes, the consortium must maintain the history of the document – or at minimum the history of its key rotations – and act as a trusted witness to the history. If it fails to do so, a compromised keypair could be used to rewrite the history and claim control of an account, even after rotation. The purpose of the append-only transparency log is to ensure that the consortium is maintaining this property.

## Root private key management

Many of our systems depend on cryptographic keypairs which are managed by end-users. We believe users should be given the options to use both custodial and non-custodial solutions. Key management is (at this stage) difficult for average consumers and so a custodial solution should be made available, but for professionals and security-conscious users a non-custodial option should also be supported.

The key manager has the following responsibilities:

- Store root private keys
- Publish updates to the users' DID Documents
- Create delegated keypairs through [UCAN](https://ucan.xyz/) issuance (see "Data Repositories" for more info)
- Handle recovery flows in the event of key loss

The key manager software integrates into the application stack in a similar fashion to SSO services. When applications want to "log in" (gain authorization) the key manager is opened with a chance for the user to choose the identity and accept or deny the grant. When core account management is needed (e.g. to change a service provider) the key manager will provide interfaces to update this config.

The key management software is seldom used, though it plays a critical role. The key manager provides an interface to authenticate/deauthenticate a new device and manage core configuration details about a user’s account.

## Notes on design decisions

Designing the identity system is a balancing act between requirements and resulting complexity. It can be useful to track how decisions affect the design, to better justify the proposal and to get entry-points to future discussion.

- **Key rotation**. Supporting key rotation for users is a valuable feature but it means that public keys cannot act as a user identifier. Instead, a content-hash of the DID document is used, and pubkeys are embedded in the document. Key changes are maintained as a history to the document. While all such updates are signed by the users' keypairs (main or recovery), a compromised keypair could be used to modify the history of key rotations. Therefore the registry must provide a trusted history for each DID document.
- **Stable DIDs**. Maintaining a stable DID keeps the network healthy (fewer broken links) and reduces the potential that users lose their social graph or content. It does, however, require a more sophisticated DID Method which must provide that stability. Hypothetically, if we were to loosen this requirement, eg to enable a provider domain name to be part of the DID, it would reduce the amount of coordination needed within the registry.
- **Online API**. DID Documents include the users' pubkeys and service endpoints. Ideally the software should be able to update the documents in convenient flows, but this requires an API for the client software to publish updates. If we can find reasonable flows for manual updates then DID methods without an online API such as did:web would also be usable.
- **Transparency log**. The use of an append-only transparency log in the consortium mandates that the history of all mutations must be stored, creating an unbounded growth of state.
