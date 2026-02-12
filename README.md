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

The script creates the necessary files and updates the blog index automatically.

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

### Are you a developer interested in building on atproto?

Bluesky is an open social network built on the AT Protocol, a flexible technology that will never lock developers out of the ecosystems that they help build. With atproto, third-party can be as seamless as first-party through custom feeds, federated services, clients, and more.

## License

Documentation text and the atproto specifications are under Creative Commons Attribution (CC-BY).

Inline code examples, example data, and regular expressions are under Creative Commons Zero (CC-0, aka Public Domain) and copy/pasted without attribution.

Please see [LICENSE.txt]() with reminders about derivative works, and [LICENSE-CC-BY.txt]() for a copy of license legal text.

Bluesky Social PBC has committed to a software patent non-aggression pledge. For details see [the original announcement](https://bsky.social/about/blog/10-01-2025-patent-pledge).
