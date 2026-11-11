# Agent instructions for atproto.com

## Blog posts

Create new posts with `npm run blog create` (or the dev-only Studio at `/studio`). Do not write the files by hand.

A post is `src/app/[locale]/blog/<slug>/` plus one entry in `src/lib/posts.ts`.

- **`en.mdx` header is the only source of post metadata.** Title, description, date, author and tags go in `export const header = { ... }`. Nothing else may repeat them.
- **Do not edit `page.tsx`.** It must be identical to `blogPageTsx()` in `src/lib/studio/templates.ts`. `src/lib/blogPages.test.ts` fails if it is not. Do not add `openGraph`, `publishedTime`, URLs or tags to a single post. If every post needs new metadata, change `mdxRouteMetadata` or the template, then regenerate every `page.tsx`.
- **`posts.ts` entry must match the header.** The values for `title`, `description`, `date`, `author` and `tags` must be the same as in the header.
- **The author name must be a key in `src/lib/authors.json`** (name → DID). If it is not, the byline shows as plain text with no link, and no error occurs. Ask for the DID; do not guess it.
- **Tags** must be ids from `blogTopics` in `src/lib/blogTags.mjs`.
- **Do not add `standardSiteUri` or `blueskyPostUrl` yourself.** A maintainer adds them with `npm run blog ssite <slug>` after the post is live.
- **Bluesky profile and post links use the DID form** (`https://bsky.app/profile/did:plc:…`), not a handle. A handle can change; a DID does not.

## Verification

Run `npm test` before you say that work is done. Do not start the dev server; a maintainer runs it.
