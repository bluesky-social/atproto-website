---
title: HTTP API (XRPC)
summary: Cross-system queries and procedures over HTTP
---

# HTTP API (XRPC)

HTTP APIs for client-server and server-server requests in atproto use a set of common conventions called XRPC. Endpoint path names include an NSID indicating the [Lexicon](/specs/lexicon) specifying the request and response schemas, usually with JSON content type.

## Lexicon HTTP Endpoints

The HTTP request path starts with `/xrpc/`, followed by an NSID. Paths must always be top-level, not below a prefix. The NSID maps to the `id` field in the associated Lexicon.

The two requests types that can be expressed in Lexicons are "query" (HTTP GET) and "procedure" (HTTP POST). Following HTTP REST semantics, queries (GET) are cacheable and should not mutate resource state. Procedures are not cacheable and may mutate state.

Lexicon `params` (under the `parameters` field) map to HTTP URL query parameters. Only certain Lexicon types can be included in params, as specified by the `params` type. Multiple query parameters with the same name can be used to represent an array of parameters. When encoding `boolean` parameters, the strings `true` and `false` should be used. Strings should not be quoted. If a `default` value is included in the schema, it should be included in every request to ensure consistent caching behavior.

Request and response body content types can be specified in Lexicon. The schema can require an exact MIME type, or a blob pattern indicating a range of acceptable types (eg, `image/*`).

JSON body schemas are specified in Lexicon using the usual atproto data model. Full validation by the server or client requires knowledge of the Lexicon, but partial validation against the abstract data model is always possible.

CORS support is encouraged but not required.

### Error Responses

All unsuccessful responses should follow a standard error response schema. The `Content-Type` should be `application/json`, and the payload should be a JSON object with the following fields:

- `error` (string, required): type name of the error (generic ASCII constant, no whitespace)
- `message` (string, optional): description of the error, appropriate for display to humans

The error type should map to an error name defined in the endpoint's Lexicon schema. This enables more specific error-handling by client software. This is particularly encouraged on `400`, `500`, and `502` status codes, where further information will be useful.

### Blob Upload and Download

Blobs are something of a special case because they can have any MIME type and are not stored directly in repositories, and thus are not directly associated with an NSID or Lexicon (though they do end up referenced from Lexicons).

The convention for working with blobs is for clients to upload them via the `com.atproto.repo.uploadBlob` endpoint, which returns a `blob` JSON object containing a CID and basic metadata about the blob. Client can then include this `blob` data in future requests (eg, include in new records). Constraints like MIME type and file size are only validated at this second step. The server may implement content type sniffing at the upload step and return a MIME type different from any `Content-Type` header provided, but a `Content-Type` header is still expected on the upload HTTP request.

Blobs for a specific account can be listed and downloaded using endpoints in the `com.atproto.sync.*` NSID space. These endpoints give access to the complete original blob, as uploaded. A common pattern is for applications to mirror both the original blob and any downsized thumbnail or preview versions via separate URLs (eg, on a CDN), instead of deep-linking to the `getBlob` endpoint on the original PDS.

### Cursors and Pagination

A common pattern in Lexicon design is to include a `cursor` parameter for pagination. The parameter should not include the parameter in the first request, and should keep all other parameters fixed between requests. If a cursor is included in a response, the next batch of responses can be fetched by including that value in a follow-on, continuing until the cursor is not included any longer, indicating the end of the result set has been reached.

## Authentication

The current authentication scheme for XRPC is HTTP Bearer auth with JWT tokens, including refresh tokens. This scheme is likely to be extended or replaced.

Not all endpoints require authentication, but there is not yet a consistent way to enumerate which endpoints do or do not.

Initial login uses the `com.atproto.server.createSession` endpoint, including the password and an account identifier (eg, handle or registered email address). This returns a `refreshJwt` (as well as an initial `accessJwt`).

Most requests should be authenticated using an access JWT, but the validity lifetime for these tokens is short. Every couple minutes, a new access JWT can be requested by hitting the `com.atproto.server.refreshSession` endpoint, using the refresh JWT instead of an access JWT.

The JWTs themselves should be treated as opaque tokens.

### App Passwords

App Passwords are a mechanism to reduce security risks when logging in to third-party clients and web applications. Accounts can create and revoke app passwords separate from their primary password. They are used to log in the same way as the primary password, but grant slightly restricted permissions to the client application, preventing destructive actions like account or changes to authentication settings (including app passwords themselves).

Clients and apps themselves do not need to do anything special to use app passwords. It is a best practice for most clients and apps to include a reminder to use an app password when logging in. App passwords usually have the form `xxxx-xxxx-xxxx-xxxx`, and clients can check against this format to prevent accidental logins with primary passwords (unless the primary password itself has this format).

### Admin Token (Temporary Specification)

Some administrative XRPC endpoints require authentication with admin privileges. The current scheme for this is to use HTTP Basic authentication with user "admin" and a fixed token in the password field, instead of HTTP Bearer auth with a JWT. This means that admin requests do not have a link to the account or identity of the client beyond "admin".

As a reminder, HTTP Basic authentication works by encoding the password (in this case, the fixed admin token) with `base64` encoding ("standard" version); joining the username and encoded password with a colon (`:`); and putting that in the `Authorization` header prefixed with `Basic`  (with a space).

As an example, if the admin token was `secret-token`, the header would look like:

```
Authorization: Basic admin:c2VjcmV0LXRva2Vu
```

The set of endpoints requiring admin auth is likely to get out of date in this specification, but currently includes:

- `com.atproto.admin.*`
- `com.atproto.server.createInviteCode`
- `com.atproto.server.createInviteCodes`

### Inter-Service Authentication (Temporary Specification)

This section describes a mechanism for authentication between services using signed JWTs. Note that this is not the long-term solution for inter-service authentication, and is likely to be replaced with a more robust mechanism in the near future.

The current mechanism is to use short-lived JWTs signed by the account's atproto signing key. The receiving service can validate the signature by checking this key against the account's DID document.

The JWT parameters are:

- `alg` header field: indicates the signing key type (see [Cryptography](/specs/cryptography))
    - use `ES256K` for `k256` keys
    - use `ES256` for `p256` keys
- `iss` body field: account DID that the request is being sent on behalf of
- `aud` body field: service DID associated with the service that the request is being sent to
- `exp` body field: token expiration time, as a UNIX timestamp with seconds precision. Should be a short time window, as revocation is not implemented. 60 seconds is a good value.
- JWT signature: base64url-encoded signature using the account DID's signing key

The signature is computed using the regular JWT process, using the account's signing key (the same used to sign repo commits). As Typescript pseudo-code, this looks like:

```
const headerPayload = utf8ToBase64Url(jsonStringify(header)) + '.' + utf8ToBase64Url(jsonString(body))
const signature = hashAndSign(accountSigningKey, utf8Bytes(headerPayload))
const jwt = headerPayload + '.' + bytesToBase64Url(signature)
```

## Summary of HTTP Headers

Clients are expected to use the following headers:

`Content-Type`: If a request body is present, this header should be included and indicate the content type.

`Authorization`: Contains auth information. See "Authentication" section of this specification for details.

## Summary of HTTP Status Codes

`200 OK`: The request was successful. If there is a response body (optional), there should be a `Content-Type` header.

`400 Bad Request`: Request was invalid, and was not processed

`401 Unauthorized`: Authentication is required for this endpoint. There should be a `WWW-Authenticate` header.

`403 Forbidden`: The client lacks permission for this endpoint

`404 Not Found`: Can indicate a missing resource. This can also indicate that the server does not support atproto, or does not support this endpoint. See response error message (or lack thereof) to clairfy.

`413 Payload Too Large`: Request body was too large. If possible, split in to multiple smaller requests.

`429 Too Many Requests`: A resource limit has been exceeded, client should back off. There may be a `Retry-After` header indicating a specific back-off time period.

`500 Internal Server Error`: Generic internal service error. Client may retry after a delay.

`501 Not Implemented`: The specified endpoint is known, but not implemented. Client should *not* retry. In particular, returned when WebSockets are requested by not implemented by server.

`502 Bad Gateway`, `503 Service Unavailable`, or `504 Gateway Timeout`: These all usually indicate temporary or permanent service downtime. Clients may retry after a delay.

## Usage and Implementation Guidelines

Clients are encouraged to implement timeouts, limited retries, and randomized exponential backoff. This increases robustness in the inevitable case of sporadic downtime, while minimizing load on struggling servers.

Servers *should* implement custom JSON error responses for all requests with an `/xrpc/` path prefix, but realistically, many services will return generic load-balancer or reverse-proxy HTML error pages. Clients should be robust to non-JSON error responses.

HTTP servers and client libraries usually limit the overall size of URLs, including query parameters, and these limits constrain the use of parameters in XRPC.

PDS implementations are free to restrict blob uploads as they see fit. For example, they may have a global maximum size or restricted set of allowed MIME types. These should be a superset of blob constraints for all supported Lexicons.

## Security and Privacy Considerations

Only HTTPS should be used over the open internet.

Care should be taken with personally identifiable information in blobs, such as EXIF metadata. It is currently the *client's* responsibility to strip any sensitive EXIF metadata from blobs before uploading. It would be reasonable for a PDS to help prevent accidental metadata leakage as well; see future changes section below.

## Possible Future Changes

The auth system is likely to be entirely overhauled.

Lexicons should be able to indicate whether auth is required.

The role of the PDS as a generic gateway may be formalized and extended. A generic mechanism for proxying specific XRPC endpoints on to other network services may be added. Generic caching of queries and blobs may be specified. Mutation of third-party responses by the PDS might be explicitly allowed.

An explicit decision about whether HTTP redirects are supported.

Cursor pagination behavior should be clarified when a cursor is returned but the result list is empty, and when a cursor value is repeated.

To help prevent accidental publishing of sensitive metadata embedded in media blobs, a query parameter may be added to the upload blob endpoint to opt-out of metadata stripping, and default to either blocking upload or auto-striping such metadata for all blobs.
