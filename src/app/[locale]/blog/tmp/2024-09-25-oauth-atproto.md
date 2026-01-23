---
slug: oauth-atproto
title: OAuth for AT Protocol
tags: ['oauth']
---

We are very happy to release the initial specification of OAuth for AT Protocol! This is expected to be the primary authentication and authorization system between atproto client apps and PDS instances going forward, replacing the current flow using App Passwords and `createSession` over time.

OAuth is a framework of standards under active development by the IETF. We selected a particular "profile" of RFCs, best practices, and draft specifications to preserve security in the somewhat unique atproto ecosystem. In particular, unlike most existing OAuth deployments and integrations, the atproto network is composed of many independent server instances, client apps, developers, and end users, who generally have not cross-registered their client software ahead of time. This necessitates both automated discovery of the user’s Authorization Server, and automated registration of client metadata with the server. In some ways this situation is closer to that between email clients and email providers than it is between traditionally pre-registered OAuth or OIDC clients (such as GitHub apps or "Sign In With Google"). This unfortunately means that generic OAuth client libraries may not work out-of-the-box with the atproto profile yet. We have built on top of draft standards (including ["OAuth Client ID Metadata Document"](https://datatracker.ietf.org/doc/draft-parecki-oauth-client-id-metadata-document/)) and are optimistic that library support will improve with time.

We laid out an [OAuth Roadmap](https://github.com/bluesky-social/atproto/discussions/2656) earlier this summer, and are entering the "Developer Preview Phase". In the coming months we expect to tweak the specification based on feedback from developers and standards groups, and to fill in a few details. We expect the broad shape of the specification to remain the same, and encourage application and SDK developers to start working with the specification now, and stop using the legacy App Password system for new projects.

### What is Ready Today?

OAuth has been deployed to several components of the atproto network over the past weeks. The Bluesky-developed PDS implementation implements the server component (including the Authorization Interface), the TypeScript client SDK now supports the client components, and several independent developers and projects have implemented login flows. At this time the Bluesky Social app has not yet been updated to use OAuth.

We have a a few resources for developers working with OAuth:

- The **TypeScript SDK** (`@atproto/api`) has been updated to support OAuth. READMEs are available for a [browser-specific package](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-browser) and a [Node.js-specific package](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-node). There is also a browser-based [example project](https://github.com/bluesky-social/atproto/tree/main/packages/oauth/oauth-client-browser-example). You can read more about upgrading in the [Typescript API Package Auth Refactor blog post](https://docs.bsky.app/blog/ts-api-refactor).
- [**OAuth Client Implementation Guide**](https://docs.bsky.app/docs/advanced-guides/oauth-client), a developer-oriented document.
- A [**Python (Flask) Web Service Demo**](https://github.com/bluesky-social/cookbook/blob/main/python-oauth-web-app/README.md) which shows how to implement a client "the hard way", without using a supporting SDK. A live version of the demo is running at [https://oauth-flask.demo.bsky.dev/](https://oauth-flask.demo.bsky.dev/) (it may not be operated indefinitely).
- The [**AT Protocol OAuth Specification**](https://atproto.com/specs/auth), which is the authoritative reference.

The current OAuth profile does not specify how granular permissions ("scopes") work with atproto. Instead, we have defined a small set of "transitional" scopes which provide the same levels of client access as the current auth system:

- `transition:generic` the same level of permissions as an App Password
- `transition:chat.bsky` is an add-on (must be included in combination with `transition:generic`) which adds access to the `chat.bsky.*` Lexicons for DMs. Same behavior as an App Password with the DM access option selected.

### Next Steps

There are two larger components which will integrate OAuth into the atproto ecosystem:

- The first is to expand the PDS account web interface to manage active OAuth sessions. This will allow users to inspect active sessions, the associated clients, and to revoke those sessions (eg, "remote log out"). This is user interface work specific to the PDS implementation, and will not change or impact the existing OAuth specification.
- The second is to design an atproto-native scopes system which integrates with Lexicons, record collections, and other protocol features. This will allow granular app permissions in an extensible manner. This is expected to be orthogonal to the current OAuth specification, and it should be relatively easy for client apps to transition to more granular permissions, though it will likely require logout and re-authentication by users.

These are big priorities for user security, and the path to implementation and deployment is clear.

While that work is in progress, we are interested in feedback from SDK developers and early adopters. What pain points do you encounter? Are there requirements which could be relaxed without reducing user security?

The overall design of this OAuth profile is similar to that of other social web protocols, such as ActivityPub. There are some atproto-specific aspects, but we are open to collaboration and harmonization between profiles to simplify and improve security on the web generally.

Finally, a number of the specifications we adopt and build upon are still drafts undergoing active development. We are interested in feedback on our specification, and intend to work with standards bodies (including the IETF) and tweak our profile if necessary to ensure compliance with final versions of any relevant standards and best practices.
