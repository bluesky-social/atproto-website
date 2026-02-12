---
slug: oauth-improvements
title: OAuth Improvements
tags: ['oauth']
---


We've been making improvements to the end-user and developer experiences with atproto OAuth, and wanted to share some updates.

## Email Transitional Scope

One of the few gaps between password authentication and the initial ("transitional") set of OAuth scopes was access to an account's email address (and email confirmation status). We have implemented a new OAuth scope, `transition:email` that clients can request for access to the account's email. The email itself can be accessed via the `com.atproto.server.getSession` endpoint on the PDS, using an OAuth access token.

## Public versus Confidential Clients

The difference between "public" and "confidential" OAuth clients is one of the more complex tradeoffs for application developers. Tradeoffs in security, privacy, trust, application architecture, session lifetime, and user experience are all entangled.

We have a new essay that tries to untangle this knot, explaining the security concerns and trade-offs involved: ["OAuth Client Security in the Atmosphere"](https://github.com/bluesky-social/atproto/discussions/3950).

We also have a proposal to enable a new architecture: ["Client Assertion Backend for Browser-based Applications"](https://github.com/bluesky-social/proposals/tree/main/0010-client-assertion-backend). In this architecture, in-browser web apps (SPAs) would communicate with a simple and generic backend server to generate client attestations for token requests. The backend could "veto" client sessions (to address security incidents), but would not directly mediate token requests. This would be distinct from the Token Mediating Backend (TMB) architecture. Note that with both architectures, the server can not hijack the session or make "offline" authenticated requests on the user's behalf, assuming the DPoP keys are held securely on-device by the web app.

## Session Lifetimes

Many developers are encountering friction with OAuth session lifetimes, especially using in-browser "public" clients. The existing lifetime limitations mean that un-refreshed sessions would time out after just two days.

There will always be shorter session lifetimes for public clients, but we think the session lifetimes can be increased without a significant security trade-off. We are planning to roll out the following session lifetimes:

- Public Clients  
  - increase overall session lifetime (after which tokens can not be refreshed) from one week to two weeks  
  - increase the lifetime of individual refresh tokens from two days to two weeks (the same as the overall session lifetime; refreshing tokens does not extend the overall session)  
- Confidential Clients  
  - increase the lifetime of individual refresh tokens from one month to three months (if tokens are not refreshed, the session ends before the overall session lifetime limit)  
  - increase overall session lifetime (assuming tokens are refreshed) from one year to two years; including existing sessions

Remember that the maximum lifetime of OAuth *access tokens* is much shorter: the specification recommends a limit of 30 minutes, and the reference implementation uses 15 minutes.

There is a tracking issue here: [bluesky-social/atproto#3883](https://github.com/bluesky-social/atproto/pull/3883) 

## Auth Scopes

Protocol design on Auth Scopes is wrapping up. This functionality will allow app developers to request granular permissions to specific atproto resources, like records (by NSID), remote API endpoints (using service proxying), account hosting status, and identity updates. The system will also allow Lexicon designers to define higher-level "bundles" of permissions for atproto resources in the same NSID namespace, to make end-user permission requests simpler.

You can learn more by reading an earlier [draft of this protocol feature from March 2025](https://github.com/bluesky-social/atproto/discussions/3655).

We will begin server-side implementation and integration work on this feature soon after a final proposal is published.

## Other Changes and Bug Fixes

The DPoP JWTs created by the `@atproto/oauth-client` TypeScript package incorrectly included query parameters as part of the `htu` request URL field, which goes against the DPoP specification. The client package has been fixed as of version [0.3.18](https://www.npmjs.com/package/@atproto/oauth-client?activeTab=versions).

The Authorization Server used to require a DPoP proof during Pushed Authorization Requests when the parameters contained a `dpop_jkt`. This was not valid per [spec](https://datatracker.ietf.org/doc/html/rfc9449#section-10.1-2.1) and is thus no longer the case.

The OAuth Client Implementation Guide previously instructed developers to include the Auth Server Issuer (host URL) in DPoP JWTs included on authenticated requests to the PDS, in the `iss` field. The example Python code and TypeScript OAuth client implementation also included this field. This is not required by the DPoP specification, and should *not* be implemented by clients or SDKs. We have updated the guide and implementations to remove this field.

The TypeScript OAuth client SDK was incorrectly sending HTTP POST requests using JSON bodies, instead of form-encoding (the server was flexible to either encoding). This has been corrected, and requests that should use form-encoding (like PAR) now do.

A couple of subtle bugs with the TypeScript OAuth client SDK and DPoP nonce caching have been fixed.

If a client app redirects to the reference PDS without a `login_hint`, and the user was already logged in, the auth flow now proceeds directly to an account selector, instead of displaying a "Create Account or Log In" page. This makes the flow smoother and reduces a click.

The client app redirect URL no longer needs to be on the same host origin as the client metadata document.
## Deprecation notice

The following invalid behaviors were detected in our reference implementation. As of now, these are considered as deprecated and might change in the future. Make sure you use the latest version of our SDKs, and if you implemented your own, please check that it is compliant.

- DPoP proofs that contain a query or fragment in the `htu` claim should be rejected.

- JWT for the client attestation using the `private_key_jwt` authentication method [MUST](https://www.rfc-editor.org/rfc/rfc7523.html#section-3) contain an `exp` claim. This is currently not enforced by the reference implementation.

- When performing a Pushed Authorization Request, the client [must](https://datatracker.ietf.org/doc/html/rfc9449#section-10.1-2.1) either provide a `dpop_jkt` authorization request parameter, or provide a DPoP proof header. The reference implementation does not enforce this, allowing the DPoP proof header to be provided only during the token exchange.
## Remaining Limitations

The account management interface on the reference PDS implementation allows revoking OAuth client sessions. On a free-standing PDS, this has an immediate effect: both access and refresh tokens stop working immediately. But the Bluesky-hosted PDS instances ("mushroom servers") use an "entryway" service as an OAuth Auth Server. A side-effect of this is that revoking client sessions could take up to 15 minutes to take effect: refresh tokens immediately stop working, but access tokens do not. This is a relatively common design tradeoff in auth systems involving many servers but is not currently well communicated in the interface.

The TypeScript OAuth Authorization server implementation (\`@atproto/oauth-provider\`) currently does not correctly validate that the initial client attestation signing key is present in the client metadata document over the full lifetime of an OAuth session. Instead, it simply validates each attestation (eg, on token refreshes) against the current JWKs in the client metadata. In other words, if a client removes a public key from the JWK set in the client metadata document, the auth server is supposed to reject future token refresh requests for sessions that started by using that specific key; but the current implementation does not do this. Similarly, our OAuth client implementation did not enforce the use of the same key whenever refreshing sessions. The tracking issue for this is [https://github.com/bluesky-social/atproto/pull/3847](https://github.com/bluesky-social/atproto/pull/3847). Note that fixing this bug might result in sessions becoming invalid if clients do not adapt their implementation to use the same key over the session’s lifetime. Clients only using a single key should not be impacted.
