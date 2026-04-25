# atproto-website

This repository contains the documentation for the AT Protocol, available to read at [atproto.com](https://atproto.com/).

To read documentation for the Bluesky API, go to [docs.bsky.app](https://docs.bsky.app/) or this [repo](https://github.com/bluesky-social/bsky-docs).
---

### Making edits to atproto.com

- clone this repo
- run `npm install`
- run the development server with `npm run dev` or `yarn dev`
- open [http://localhost:3000](http://localhost:3000) with your browser.

---

[src/app/[locale]/en.mdx](https://github.com/bluesky-social/atproto-website/blob/main/src/app/[locale]/en.mdx) generates [http://localhost:3000](http://localhost:3000) -- start there if you'd like to make changes.

The page auto-updates as you edit the file.

---

### Blog tools

All blog-related commands are available through a single entry point:

```bash
npm run blog <command>
```

| Command | Description |
|---------|-------------|
| `npm run blog create` | Create a new blog post |
| `npm run blog remove` | Remove a blog post |
| `npm run blog ssite <slug>` | Publish a post as a standard-site record |
| `npm run blog hide-reply <url>` | Hide a reply or detach a quote post |
| `npm run blog create-publication` | Create the publication record (one-time setup) |

Run `npm run blog` with no arguments to see this list.

### Creating a new blog post

```bash
npm run blog create
```

This will prompt you for:
- **Title** - The post title
- **Slug** - URL-friendly identifier (auto-suggested from title)
- **Description** - Short summary for the blog index
- **Author** - Defaults to "AT Protocol Team"
- **Bluesky DID** - If the author isn't in the registry, you'll be prompted for their DID (optional)

The script creates the necessary files and updates the blog index automatically.

#### Author bylines

Individual blog post pages display an author byline below the date. Named authors with a Bluesky DID are linked to their `bsky.app` profile.

Author-to-DID mappings are stored in `src/lib/authors.json`, which serves as the single source of truth. The `PageHeader` component looks up the DID at render time based on the `author` name from the post's MDX header — no need to store DIDs in individual posts.

When creating a new post, if the author name isn't found in the registry, the script will prompt for a DID and automatically add it to `authors.json` for future posts. Authors without a DID (e.g. guest authors) simply get a plain text byline with no link.

### Removing a blog post

```bash
npm run blog remove
```

This displays a paginated list of blog posts (10 at a time, most recent first). Select a post by number to remove it. The script will:
- Ask for confirmation before proceeding
- Remove the post entry from `src/lib/posts.ts`
- Delete the post directory and all its files (content, translations, images)

### RSS / Atom / JSON Feed

The blog provides three feed formats, auto-discoverable via `<link>` tags:

- **Atom** (recommended): `/feed.xml`
- **RSS 2.0**: `/rss.xml`
- **JSON Feed 1.1**: `/feed.json`

Each feed includes the 50 most recent posts. Post data is shared from `src/lib/posts.ts`.

---

### Publishing blog posts to AT Protocol

Blog posts can be published to the AT Protocol using the [site.standard](https://standard.site/) lexicon. This enables decentralized discovery and verification of content.

#### Setup (one-time)

1. **Configure credentials:**
   ```bash
   cp .env.example .env
   ```
   Fill in your `ATPROTO_HANDLE` and `ATPROTO_APP_PASSWORD` (create an app password in Bluesky settings).

2. **Create the publication record:**
   ```bash
   npm run blog create-publication
   ```
   Save the returned AT-URI to your `.env` as `ATPROTO_PUBLICATION_URI`.

#### Publishing a post

```bash
npm run blog ssite <slug>
```

For example:
```bash
npm run blog ssite welcome-to-the-blog
```

This will:
- Create a `standard.site` document record on your PDS
- Save the AT-URI back to the post's MDX file for verification
- Update the record if it already exists

TODO:
- Integrate this into the publishing pipeline so all of this happens automatically

#### Verification

The site implements [site.standard verification](https://standard.site/):

- **Publication:** `/.well-known/site.standard.publication` returns the publication AT-URI
- **Documents:** Each published post includes a `<link rel="site.standard.document">` tag

For production, set `ATPROTO_PUBLICATION_URI` in your deployment environment.

---

### Bluesky Discussion Component

Blog posts can display a conversation section powered by Bluesky. The `<bsky-conversation>` web component fetches replies, quote posts, and reposts for a given Bluesky post and renders them as a threaded timeline.

#### How it works

1. Post the blog link from the account on Bluesky
2. Add the post URL (using the DID, not the handle) to the blog post's MDX header:
   ```js
   export const header = {
     // ...
     blueskyPostUrl: 'https://bsky.app/profile/did:plc:ewvi7nxzyoun6zhxrhs64oiz/post/3mf2y35apvc2i'
   }
   ```
3. The conversation section renders automatically below the post content

#### Standalone usage

The web component at `public/bsky-conversation.js` has zero dependencies and can be used on any site:

```html
<script src="/bsky-conversation.js"></script>
<bsky-conversation uri="https://bsky.app/profile/did:plc:.../post/..."></bsky-conversation>
```

#### Attributes

| Attribute | Default | Description |
|-----------|---------|-------------|
| `uri` | (required) | The bsky.app post URL. Use DID-based URLs for reliability. |
| `max-depth` | `3` | How many levels of nested replies to show. Also controls how deep the API fetches. At the cutoff, a "More of the conversation on Bluesky" link appears. |
| `show-original-post` | `false` | Set to `"true"` to include the root post in the timeline. |
| `engage-text` | `"Add your thoughts on Bluesky"` | CTA link text shown in the header and at the bottom of the conversation. Set to `""` to hide both. |
| `header-template` | (none) | Custom header template string. Overrides the default `<ul>` header format. |

#### Template syntax

The `header-template` attribute supports a mini template language for interpolating conversation data.

**Simple tokens** — replaced with their value:

| Token | Value |
|-------|-------|
| `{replies}` | Raw reply count |
| `{quotes}` | Raw quote count |
| `{reposts}` | Raw repost count |
| `{repostedBy}` | Linked names, e.g. `@alice, @bob, and 3 others` |
| `{postUrl}` | The bsky.app post URL |

**Pluralization** — `{name|singular|plural}` outputs nothing when the count is 0, `"1 singular"` when 1, `"N plural"` when 2+:

```
{replies|reply|replies}        → "" or "1 reply" or "17 replies"
{quotes|quote|quotes}          → "" or "1 quote" or "5 quotes"
```

**Conditional blocks** — `{name?content}` renders content only if the value is truthy (non-zero, non-empty). Use this to wrap text around tokens that might be absent:

```
{repostedBy?Reposted by {repostedBy}.}    → "" or "Reposted by @alice, @bob."
{replies?{replies|reply|replies} so far}   → "" or "17 replies so far"
```

**Full example:**

```html
<bsky-conversation
  uri="https://bsky.app/profile/did:plc:.../post/..."
  header-template="This post has {replies?{replies|reply|replies}}{quotes?, {quotes|quote|quotes}}{repostedBy?, and has been reposted by {repostedBy}}."
/>
```

When no template is provided, the component falls back to its default `<ul>`-based header with individual stats items.

#### Site-wide defaults

The header template for this site is configured as a constant in `src/components/Page.tsx`. Per-page overrides are possible via the MDX header:

```js
export const header = {
  // ...
  blueskyHeaderTemplate: "...",
}
```

#### CSS custom properties

The component defines design tokens with sensible defaults, overridable from the host page. More to come!

| Property | Light default | Dark default | Controls |
|----------|--------------|-------------|----------|
| `--bsky-border-color` | `#e5e7eb` | `#374151` | Separators, thread lines |
| `--bsky-muted-color` | `#6b7280` | `#9ca3af` | Handles, timestamps, secondary text |
| `--bsky-link-color` | `black` | `#60a5fa` | Link text color |
| `--bsky-link-hover` | `#2563eb` | `#3b82f6` | Link hover color |
| `--bsky-link-underline` | `rgba(82,82,91,0.5)` | `rgba(59,130,246,0.3)` | Link underline color |
| `--bsky-link-underline-hover` | `rgba(59,130,246,0.3)` | `rgba(59,130,246,0.3)` | Link underline hover color |

Override example:
```css
bsky-conversation {
  --bsky-link-color: #333;
  --bsky-muted-color: #888;
}
```

The component inherits all typography (font-family, font-size, line-height, color) from its parent. All internal sizing uses `em` units so it scales with the inherited font size.

#### Behavior notes

- The root post author's direct replies are filtered out (they're extensions of the original post, not conversation). The author's replies to *other people's* comments are shown.
- **Hidden replies are filtered out.** If you hide a reply on bsky.app (click the `···` menu on a reply → "Hide reply for everyone"), it won't appear in the conversation component. This works at all nesting levels. Note: "Hide reply for me" is a personal mute and won't affect what the component shows — you need "Hide reply for everyone" to write to the public threadgate record.
- Reply threads are capped at 3 levels deep by default (configurable via `max-depth`). A "More of the conversation on Bluesky" link appears at the cutoff.
- Reply threads stay grouped — nested replies are not flattened into the timeline.
- **Detached quote posts are filtered out.** If you detach a quote on bsky.app (or via the script below), it won't appear in the conversation component.
- Quote posts are interleaved chronologically with top-level reply threads.
- Reposts appear only in the header summary, not as timeline items.
- API failures (e.g., `getRepostedBy` returning 500) degrade gracefully — the rest of the conversation still renders.

#### Moderation script

The `hide-reply` script lets you hide replies or detach quote posts from the conversation component via the command line. It auto-detects the post type:

```bash
# Hide a reply (adds to threadgate hiddenReplies)
npm run blog hide-reply https://bsky.app/profile/did:plc:.../post/...

# Detach a quote post (adds to postgate detachedEmbeddingUris)
npm run blog hide-reply https://bsky.app/profile/did:plc:.../post/...
```

Requires `ATPROTO_HANDLE` and `ATPROTO_APP_PASSWORD` in `.env`. The authenticated user must own the root post being replied to or quoted.

- **Replies**: The script walks up the thread to find the root post and adds the reply URI to the root post's `app.bsky.feed.threadgate` record. This is equivalent to "Hide reply for everyone" on bsky.app.
- **Quote posts**: The script detects the embedded post and adds the quote URI to the root post's `app.bsky.feed.postgate` record. This is equivalent to "Detach quote" on bsky.app.

#### TODO
- handle newlines in replies
- handle images in replies (or don't!)
- lots of styling
- more templating
- how should quote posts appear differently from replies?
- extract into standalone project(?)

---

### Scope Builder widgets

Two interactive web components live at `src/components/ScopeBuilder/` and are embedded as the only content of two guide pages:

- **`<scope-builder>`** at [`/guides/scope-builder`](https://atproto.com/guides/scope-builder) — picks scopes from a curated catalog (apps + their permission sets, plus standalone individual scopes) and assembles a complete OAuth scope string ready to paste into `oauth-client-metadata.json`.
- **`<permission-author>`** at [`/guides/permission-set-builder`](https://atproto.com/guides/permission-set-builder) — composes individual permissions into a permission-set Lexicon JSON document for lexicon authors who want to publish their own.

Both are vanilla JS custom elements; thin React loaders (`ScopeBuilderLoader.tsx`, `PermissionAuthorLoader.tsx`) handle client-side registration. See [`src/components/ScopeBuilder/README.md`](src/components/ScopeBuilder/README.md) for architecture details and how to add a new app to the curated catalog.

#### `@atproto/oauth-scopes` dependency

Scope-string serialization uses the official [`@atproto/oauth-scopes`](https://www.npmjs.com/package/@atproto/oauth-scopes) package as the canonical implementation. Our wrappers in `scopeUtils.ts` adapt the library's strict types to the looser shapes our forms produce, but the actual scope-string formatting flows through the library at runtime.

To keep it current:

```bash
npm update @atproto/oauth-scopes
npm test
npm run dev   # spot-check both guide pages
```

The unit tests cover the format expectations end-to-end. If the library's output format ever changes, the test suite is the first place you'll see it. After upgrades, also visit `/guides/scope-builder` and `/guides/permission-set-builder` to verify the generated strings still look right; the assembled scope string is sorted alphabetically by the library, so any visual regression there is the first signal.

The curated permission-set catalog in `scopeData.ts` is hand-maintained — adding a new app or a new permission set means appending a few lines there, not running a generator. The library does not author Lexicons, only parse them.

#### Adding a permission set to the catalog

When a third-party app publishes a permission-set Lexicon and we want it to appear in the Scope Builder's pill row, edit `src/components/ScopeBuilder/scopeData.ts`. Both the app and the set live in this one file.

You'll need:

- The publishing repo's **DID** (e.g., `did:plc:...`). Find it on the app's profile or via [Lexicon Garden](https://lexicon.garden).
- The permission set's **NSID** (e.g., `app.acme.authFull`).
- The set's **title** and **detail** (copy from the Lexicon record's `defs.main.title` and `defs.main.detail`, easiest to grab from `https://lexicon.garden/lexicon/<did>/<nsid>/llms.txt`).
- The list of **permissions** the set bundles (also in the same Lexicon record, under `defs.main.permissions`).
- The set's **audience DID** if it contains rpc permissions with `inheritAud: true`. Most third-party sets are repo-only and don't need this.

The recipe:

1. **Add a DID constant** near the top of `scopeData.ts`, alongside the existing `BSKY_DID`, `BEACONBITS_DID`, etc:

   ```ts
   const ACME_DID = 'did:plc:...'
   ```

2. **Append to the `apps[]` array**, keeping it alphabetical:

   ```ts
   { id: 'acme', name: 'Acme', did: ACME_DID },
   ```

3. **Append one entry per permission set** to `permissionSets[]`, with `appId` matching what you used in step 2:

   ```ts
   {
     id: 'app.acme.authFull',                   // same as the NSID
     appId: 'acme',
     label: 'Full Acme Access',                 // from the Lexicon's title
     description: 'One-line summary for the checkbox.',
     kind: 'permission-set',
     resourceType: 'include',
     scopeString: 'include:app.acme.authFull',  // add `?aud=...%23...` only if defaultAud is set
     // defaultAud: 'did:web:api.acme.app#api', // ONLY for sets with rpc inheritAud permissions
     expandedPermissions: {
       repo: [
         { collection: 'app.acme.thing', actions: [...ALL_WRITE_ACTIONS] },
       ],
       rpc: ['app.acme.getThings'],             // omit if the set has no rpc permissions
     },
     specLink: lexiconGardenLink(ACME_DID, 'app.acme.authFull'),
     explanation: 'Longer prose shown when the user expands the checkbox.',
   }
   ```

   The `defaultAud` field is in **unencoded** form (raw `#`); the library handles `%23` encoding when emitting scope strings. Only include it if the underlying Lexicon contains `rpc` permissions with `inheritAud: true` — for repo-only sets, omit it and the include-scope string drops the `?aud=` suffix.

4. **Run the test suite** (`npm test`) to confirm the data shape is valid. Then `npm run dev` and visit `/guides/scope-builder` to verify the new pill appears alphabetically and the set's bundled permissions render under "Bundled permissions (N)."

For adding individual (non-set) scopes, scopes with subset relationships, warning badges, or the deeper rendering details, see [`src/components/ScopeBuilder/README.md`](src/components/ScopeBuilder/README.md#adding-to-the-catalog).

---

### Are you a developer interested in building on atproto?

Bluesky is an open social network built on the AT Protocol, a flexible technology that will never lock developers out of the ecosystems that they help build. With atproto, third-party can be as seamless as first-party through custom feeds, federated services, clients, and more.

## License

Documentation text and the atproto specifications are under Creative Commons Attribution (CC-BY).

Inline code examples, example data, and regular expressions are under Creative Commons Zero (CC-0, aka Public Domain) and copy/pasted without attribution.

Please see [LICENSE.txt]() with reminders about derivative works, and [LICENSE-CC-BY.txt]() for a copy of license legal text.

Bluesky Social PBC has committed to a software patent non-aggression pledge. For details see [the original announcement](https://bsky.social/about/blog/10-01-2025-patent-pledge).
