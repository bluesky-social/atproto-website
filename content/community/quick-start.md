---
title: Quick Start Guide
summary: Get started with the atproto API.
---

# Quick Start Guide

Bluesky PBLLC maintains a TypeScript protocol implementation. The API is available for use [here](https://www.npmjs.com/package/@atproto/api?activeTab=readme).

To get started with this package, install:

```
npm install @atproto/api
```

To import this package in your application, use:

```TypeScript
import { BskyAgent } from '@atproto/api'
```

Set your username and password as environment variables. Create a Bluesky agent and login with the below excerpt:

```Typescript
const agent = new BskyAgent({ service: 'https://bsky.social' })

await agent.login({
  identifier: process.env.BLUESKY_USERNAME!,
  password: process.env.BLUESKY_PASSWORD!,
});
```
To use this agent to create a post: 

```Typescript
await agent.post({
    text: "Hello world"
});
```

View more sample API calls in the [package documentation](https://www.npmjs.com/package/@atproto/api).

## More Protocol Implementations

For libraries in more languages, visit the [community projects page](/community/projects#protocol-implementations).


# Blog

We publish blogs for a developer audience [here](https://atproto.com/blog).

We publish blog posts for a general audience on the Bluesky site [here](https://blueskyweb.xyz/blog), for example:
- [Federation Architecture Overview](https://blueskyweb.xyz/blog/5-5-2023-federation-architecture)
- [Algorithmic Choice](https://blueskyweb.xyz/blog/3-30-2023-algorithmic-choice)
- [Composable Moderation](https://blueskyweb.xyz/blog/4-13-2023-moderation)