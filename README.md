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

### Creating a new blog post

Run the blog post generator:

```bash
npm run blog
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
npm run rmblog
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
   npm run create-publication
   ```
   Save the returned AT-URI to your `.env` as `ATPROTO_PUBLICATION_URI`.

#### Publishing a post

```bash
npm run publish-post <slug>
```

For example:
```bash
npm run publish-post welcome-to-the-blog
```

This will:
- Create a `site.standard.document` record on your PDS
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
| `show-original-post` | `false` | Set to `"true"` to include the root post in the timeline. |
| `engage-text` | `"Comment or quote on Bluesky"` | CTA link text. Set to `""` to hide. |

#### Behavior notes

- The root post author's direct replies are filtered out (they're extensions of the original post, not conversation). The author's replies to *other people's* comments are shown.
- Reply threads stay grouped — nested replies are not flattened into the timeline.
- Quote posts are interleaved chronologically with top-level reply threads.
- Reposts appear only in the header summary, not as timeline items.
- API failures (e.g., `getRepostedBy` returning 500) degrade gracefully — the rest of the conversation still renders.

#### TODO
- handle newlines in replies
- handle images in replies (or don't!)
- lots of styling
- how should quote posts appear differently from replies?
- extract into standalone project(?)

---

### Are you a developer interested in building on atproto?

Bluesky is an open social network built on the AT Protocol, a flexible technology that will never lock developers out of the ecosystems that they help build. With atproto, third-party can be as seamless as first-party through custom feeds, federated services, clients, and more.

## License

Documentation text and the atproto specifications are under Creative Commons Attribution (CC-BY).

Inline code examples, example data, and regular expressions are under Creative Commons Zero (CC-0, aka Public Domain) and copy/pasted without attribution.

Please see [LICENSE.txt]() with reminders about derivative works, and [LICENSE-CC-BY.txt]() for a copy of license legal text.

Bluesky Social PBC has committed to a software patent non-aggression pledge. For details see [the original announcement](https://bsky.social/about/blog/10-01-2025-patent-pledge).
