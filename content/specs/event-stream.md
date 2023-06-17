---
title: Event Stream
summary: Network wire protocol for subscribing to a stream of Lexicon objects
wip: true
---

# Event Stream

In addition to regular [HTTP API](/specs/xrpc) endpoints, atproto supports continuous event streams. Message schemas and endpoint names are transport-agnostic and defined in [Lexicons](/specs/lexicon). The initial encoding and transport scheme uses binary [DAG-CBOR](https://ipld.io/docs/codecs/known/dag-cbor/) encoding over [WebSockets](https://en.wikipedia.org/wiki/WebSocket).

The Lexicon type for streams is `subscription`. The schema includes an identifier (`id`) for the endpoint, a `message` schema (usually a union, allowing multiple message types), and a list of error types (`errors`).

Clients subscribe to a specific stream by initiating a connection at the indicated endpoint. Streams are currently one-way, with messages flowing from the server to the client. Clients may provide query parameters to configure the stream when opening the connection.

A **backfill window** mechanism allows clients to catch up with stream messages they may have missed. At a high level, this works by assigning monotonically increasing sequence numbers to stream events, and allowing clients to specify an initial sequence number when initiating a connection. The intent of this mechanism is to ensure reliable delivery of events following disruptions during a reasonable time window (eg, hours or days). It is not to enable clients to roll all the way back to the beginning of the stream.

All of the initial subscription Lexicons in the `com.atproto` namespace use the backfill mechanism. However, a backfill mechanism (and even cursors, which we define below) is not _required_ for streams. Subscription endpoints which do not require reliable delivery do not need to implement a backfill mechanism or use sequence numbers.

The initial subscription endpoints are also public and do not require authentication or prior permission to subscribe (though resource limits may be imposed on client). But subscription endpoints may require authentication at connection time, using the existing HTTP API (XRPC) authentication methods.


## Streaming Wire Protocol (v0)

To summarize, messages are encoded as DAG-CBOR and sent over a binary WebSocket. Clients connect to to a specific HTTP endpoint, with query parameters, then upgrade to WebSocket. Every WebSocket frame contains two DAG-CBOR objects, with bytes concatenated together: a header (indicating message type), and the actual message.

The WebSockets "living standard" is currently maintained by [WHATWG](https://en.wikipedia.org/wiki/WHATWG), and can be found in full at [https://websockets.spec.whatwg.org/](https://websockets.spec.whatwg.org/).

### Connection

Clients initialize stream subscriptions by opening an HTTP connection and upgrading to a WebSocket. HTTPS and "WebSocket Secure" (`wss://`) on the default port (443) should be used for all connections on the internet. HTTP, cleartext WebSocket (`ws://`), and non-standard ports should only be used for testing, development, and local connections (for example, behind a reverse proxy implementing SSL). From the client perspective, failure to upgrade connection to a WebSocket is an error.

Query parameters may be provided in the initial HTTP request to configure the stream in an application-specific way, as specified in the endpoint's Lexicon schema.

Errors are usually returned through the stream itself. Connection-time errors are sent as the first message on the stream, and then the server drops the connection. But some errors can not be handled through the stream, and are returned as HTTP errors:

- `405 Method Not Allowed`: Returned to client for non-GET HTTP requests to a stream endpoint.
- `426 Upgrade Required`: Returned to client if `Upgrade` header is not included in a request to a stream endpoint.
- `429 Too Many Requests`: Frequently used for rate-limiting. Client may try again after a delay. Support for the `Retry-After` header is encouraged.
- `500 Internal Server Error`: Client may try again after a delay
- `501 Not Implemented`: Service does not implement WebSockets or streams, at least for this endpoint. Client should not try again.
- `502 Bad Gateway`, `503 Service Unavailable`, `504 Gateway Timeout`: Client may try again after a delay

Servers *should* return HTTP bodies as JSON with the standard XRPC error message schema for these status codes. But clients also need to be robust to unexpected response body formats. A common situation is receiving a default load-balancer or reverse-proxy error page during scheduled or unplanned downtime.

Either the server or the client may decided to drop an open stream connection if there have been no messages for some time. It is also acceptable to leave connections open indefinitely.

### Framing

Each binary WebSocket frame contains two DAG-CBOR objects, concatenated. The first is a **header** and the second is the **payload.**

The header DAG-CBOR object has the following fields:

- `op` ("operation", integer, required): fixed values, indicating what this frame contains
    - `1`: a regular message, with type indicated by `t`
    - `-1`: an error message
- `t` ("type", string, optional): required if `op` is `1`, indicating the Lexicon sub-type for this message, in short form. Does not include the full Lexicon identifier, just a fragment. Eg: `#commit`. Should not be included in header if `op` is `1`.

Clients should ignore frames with headers that have unknown `op` or `t` values. Unknown fields in both headers and payloads should be ignored. Invalid framing or invalid DAG-CBOR encoding are hard errors, and the client should drop the entire connection instead of skipping the frame. Servers should ignore any frames received from the client, not treat them as errors.

Error payloads all have the following fields:

- `error` (string, required): the error type name, with no namespace or `#` prefix
- `message` (string, optional): a description of the error

Streams should be closed immediately following transmitting or receiving an error frame.

Message payloads must always be objects. They should omit the `$type` field, as this information is already indicated in the header. There is no specific limit on the size of WebSocket frames in atproto, but they should be kept reasonably small (around a couple megabytes).

If a client can not keep up with the rate of messages, the server may send a "too slow" error and close the connection.

### Sequence Numbers

Streams can optionally make use of per-message sequence numbers to improve the reliability of transmission. Clients keep track of the last sequence number they received and successfully processed, and can specify that number after a re-connection to receive any missed messages, up to some roll-back window. Servers persist no client state across connections. The semantics are similar to [Apache Kafka](https://en.wikipedia.org/wiki/Apache_Kafka)'s consumer groups and other stream-processing protocols.

Subscription Lexicons must include a `seq` field (integer type), and a `cursor` query parameter (integer type). Not all message types need to include `seq`. Errors do not, and it is common to have an `#info` message type that is not persisted.

Sequence numbers are always positive integers (non-zero), and increase monotonically, but otherwise have flexible semantics. They may contain arbitrary gaps. For example, they might be timestamps.

To prevent confusion when working with Javascript (which by default represents all numbers as floating point), sequence numbers should be limited to the range of integers which can safely be represented by a 64-bit float. That is, the integer range `1` to `2^53` (not inclusive on the upper bound).

The connection-time rules for cursors and sequence numbers:

- no `cursor` is specified: the server starts transmitting from the current stream position
- `cursor` is higher than current `seq` ("in the future"): server sends an error message and closes connection
- `cursor` is in roll-back window: server sends any persisted messages with greater-or-equal `seq` number, then continues once "caught up" with current stream
- `cursor` is older than roll-back window: the first message in stream is an info indicating that `cursor` is too-old, then starts at the oldest available `seq` and sends the entire roll-back window, then continues with current stream
- `cursor` is `0`: server will start at the oldest available `seq`, send the entire roll-back window, then continue with current stream

The scope for sequence numbers is the combination of service provider (hostname) and endpoint (NSID). This roughly corresponds to the `wss://` URL used for connections. That is, sequence numbers may or may not be unique across different stream endpoints on the same service.

Services should ensure that sequence numbers are not re-used, usually by committing events (with sequence number) to robust persistent storage before transmitting them over streams.

In some catastrophic failure modes, or large changes in infrastructure, it is possible that a server would both data from the backfill window, and need to reset the sequence number back to `1`. In this case, if a client re-connects with a higher number, the server would send back a `FutureCursor` error to the client. The client needs to decide what strategy to follow in these scenarios. We suggest that clients treat out-of-order or duplicate sequence numbers as an error, not process the message, and drop the connection. Most clients should not reset sequence state without human operator intervention, though this may be a reasonable behavior for some ephemeral clients not requiring reliable delivery of every event in the stream.

## Usage and Implementation Guidelines

The current stream transport is primarily designed for server-to-server data synchronization. It is also possible for web applications to connect directly from end-user browsers, but note that decoding binary frames and DAG-CBOR is non-trivial.

The combination of HTTP redirects and WebSocket upgrades is not consistently supported by WebSocket client libraries. Support is not specifically required or forbidden in atproto.

Supported versions of the WebSockets standard are not specified by atproto. The current stable WebSocket standard is version 13. Implementations should make reasonable efforts to support modern versions, with some window of backwards compatibility.

WebSockets have distinct resource rate-limiting and denial-of-service issues. Network bandwidth limits and throttling are recommended for both servers and clients. Servers should tune concurrent connection limits and buffer sizes to prevent resource exhaustion.

If services need to reset sequence state, it is recommended to chose a new initial sequence number with a healthy margin above any previous sequence number. For example, after persistent storage loss, or if clearing prior stream state.

URLs referencing a stream endpoint at a particular host should generally use `wss://` as the URI scheme (as opposed to `https://`).

## Security and Privacy Considerations

As mentioned in the "Connection" section, only `wss://` (SSL) should be used for stream connections over the internet. Public services should reject non-SSL connections.

Most HTTP XRPC endpoints work with content in JSON form, while stream endpoints work directly with DAG-CBOR objects as untrusted input. Precautions must be taken against hostile data encoding and data structure manipulation. Specific issues are discussed in the [Data Model](/specs/data-model) and [Repository](/specs/repository) specifications.

## Possible Future Changes

Event Streams are one of the newest components of the AT Protocol, and the details are more likely to be iterated on compared to other components.

The sequence number scheme may be tweaked to better support sharded streams. The motivation would be handle higher data throughputs over the public internet by splitting across multiple connections.

Additional transports (other than WebSocket) and encodings (other than DAG-CBOR) may be specified. For example, JSON payloads in text WebSocket frames would be simpler to decode in browsers.

Additional WebSocket features may be adopted:

- transport compression "extensions" like `permessage-deflate`
- definition of a sub-protocol
- bi-directional messaging
- 1000-class response codes

Ambiguities in this specification may be resolved, or left open. For example:

- HTTP redirects
- CORS and other issues for browser connections
- maximum message/frame size

Authentication schemes may be supported, similar to those for regular HTTP XRPC endpoints.
