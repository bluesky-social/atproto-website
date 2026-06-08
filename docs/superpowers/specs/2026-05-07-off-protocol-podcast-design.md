# Off Protocol Podcast — Design Spec

**Date:** 2026-05-07
**Status:** Approved, ready for implementation plan
**Author:** Jim Ray (with Claude)

## Summary

Add a podcast section to atproto.com for a show called *Off Protocol*. The
section mirrors the existing `/blog` architecture (per-slug directories with
MDX content, a typed metadata array, a CLI scaffolder) but adds podcast-specific
concerns: native audio playback, transcript disclosure, an RSS 2.0 + iTunes
namespace feed for podcatchers, subscribe links, and a Bluesky discussion
embed per episode.

The show is self-hosted (MP3s on external object storage / CDN), distributed
via RSS to Apple Podcasts, Spotify, Overcast, and Pocket Casts.

## Goals

- A `/off-protocol` listing page that mirrors the visual rhythm of `/blog`
- Per-episode pages with native `<audio>` playback, show notes, optional
  transcript, subscribe buttons, and a Bluesky discussion thread
- An RSS feed at `/off-protocol/rss.xml` that podcatchers will accept
- A `npm run podcast` CLI for scaffolding new episodes (mirrors `npm run blog`)
- Header + mobile nav entry for "Off Protocol"

## Non-goals (deferred)

- `npm run podcast validate` (manual RSS validation in launch checklist instead)
- Per-episode OG / social-share cards (one show-wide card for v1)
- Localized show notes (English-only feed and pages)
- A custom branded audio player (native `<audio controls>`)
- Chapter markers
- Publishing episodes as `standard.site` records
- Automated tests / Vitest setup
- Custom episode search (rely on existing site search picking up episode pages)

## Architecture

### File layout

```
src/
  app/[locale]/
    off-protocol/
      page.tsx                          # episode listing (index)
      rss.xml/route.ts                  # RSS feed (Next.js route handler)
      <slug>/
        page.tsx                        # episode page (loads MDX)
        en.mdx                          # show notes (markdown body)
        transcript.mdx                  # optional transcript
  components/
    EpisodePage.tsx                     # podcast equivalent of Page.tsx
    EpisodeHeader.tsx                   # title, date, guests, cover, <audio>, subscribe
    SubscribeLinks.tsx                  # RSS + podcast:// buttons (extensible)
    EpisodeTranscript.tsx               # <details> disclosure wrapping transcript MDX
  lib/
    episodes.ts                         # array of episode metadata
    podcast-feed.ts                     # builds RSS XML from episodes[]
public/
  off-protocol/
    cover.jpg                           # show-wide cover (≥1400×1400 for Apple)
scripts/
  podcast.mjs                           # CLI dispatcher
  new-episode.mjs                       # `podcast create`
  remove-episode.mjs                    # `podcast remove`
```

### Two intentional differences from /blog

1. **Transcripts in a sibling MDX file**, not the same file as show notes.
   Show notes (skim) and transcripts (search) have different reading patterns,
   and a 60-minute transcript inflates the show notes file enough that authors
   stop wanting to edit it. The episode page imports both and renders the
   transcript inside a `<details>` disclosure beneath show notes.
2. **A dedicated `EpisodePage` component** instead of overloading the existing
   `Page` / `PageHeader`. Podcast metadata (audio URL, duration, episode number,
   guests, cover) differs enough that overloading the blog `PageHeader` would
   muddy both surfaces.

## Data model

### `src/lib/episodes.ts`

```ts
export interface Episode {
  slug: string                  // URL slug, e.g. "ep-01-why-atproto"
  episodeNumber: number         // 1, 2, 3… used for ordering + RSS <itunes:episode>
  title: string
  description: string           // 1–2 sentence summary, used in listing + RSS + OG
  date: string                  // human-readable, e.g. "May 7, 2026"
  pubDate: string               // ISO 8601, used for RSS <pubDate>
  duration: string              // "HH:MM:SS" — RSS spec wants this format
  durationSeconds: number       // numeric, easier to format/sort/sum
  guests?: string[]             // ["Jay Graber", "Paul Frazee"]
  host?: string                 // defaults to "Jim Ray" when omitted
  audioUrl: string              // absolute CDN URL to the MP3
  audioSizeBytes: number        // required for RSS <enclosure length="…">
  audioMimeType?: string        // defaults to "audio/mpeg"
  coverImage?: string           // episode cover (square, ≥1400px); falls back to SHOW.coverImage
  hasTranscript?: boolean       // true if transcript.mdx exists
  explicit?: boolean            // RSS <itunes:explicit>; defaults false
  blueskyPostUrl?: string       // optional Bluesky discussion thread anchor
}

export const SHOW = {
  title: 'Off Protocol',
  description: '…',
  author: 'AT Protocol Team',
  defaultHost: 'Jim Ray',
  ownerEmail: '…',              // required by Apple Podcasts
  language: 'en-us',
  category: 'Technology',
  coverImage: '/off-protocol/cover.jpg',
  feedUrl: 'https://atproto.com/off-protocol/rss.xml',
  siteUrl: 'https://atproto.com/off-protocol',
  subscribe: {
    apple: null,                // populated post-launch after directory ingestion
    spotify: null,
    overcast: null,
    pocketcasts: null,
    rss: 'https://atproto.com/off-protocol/rss.xml',
    generic: 'podcast://atproto.com/off-protocol/rss.xml',
  },
} as const

export const episodes: Episode[] = [
  // newest first, mirroring posts.ts ordering
]
```

### Why two date fields and two duration fields

Display formats (`"May 7, 2026"`, `"42:18"`) and machine formats (ISO 8601,
seconds as a number) serve different consumers. Deriving one from the other at
render time means re-parsing on every page load and risks subtle locale bugs.
The `podcast create` script populates both in sync, so they cannot drift unless
edited by hand. **This must be documented in the README** so future contributors
understand it's deliberate.

### MDX header frontmatter

Each episode's `en.mdx` exports a `header` matching the same fields the
`EpisodePage` component needs, parallel to how blog posts work today.

## Episode page layout

Top to bottom:

1. **Episode header**: cover art (square, ~200px), episode number + date,
   title, description, guests, "Hosted by …", duration
2. **Native `<audio controls preload="metadata">`** — `metadata`, not `auto`,
   so we don't pull 80MB on every page load
3. **Subscribe links** (RSS + generic `podcast://` for v1)
4. **Show notes** — rendered `en.mdx` using the existing `Prose` component
5. **Transcript** — `<details>` closed by default, wrapping `transcript.mdx`
   in a `prose-sm` variant. Browsers search inside collapsed `<details>` for
   in-page Find.
6. **Bluesky discussion** — same `BlueskyConversation` component blog posts use,
   keyed off `episode.blueskyPostUrl`

No autoplay.

## RSS feed

### Route

`src/app/[locale]/off-protocol/rss.xml/route.ts` — a Next.js route handler that
returns `application/rss+xml`. Rendered at build time on Cloudflare Pages,
cached by the CDN.

The feed is exported only at the **default locale**. Other locales 301 to it.
Podcatchers expect one feed per show.

### Builder

`src/lib/podcast-feed.ts`:

```ts
export function buildPodcastFeed(show: typeof SHOW, episodes: Episode[]): string
```

A pure function. Route handler reads data, calls the builder, sets headers,
returns. Pure function is trivially testable (when we eventually add tests).

### Generated XML

RSS 2.0 with `xmlns:itunes` and `xmlns:content` namespaces. Per item:

- `<title>`, `<description>` (plain text), `<pubDate>` (RFC 822)
- `<enclosure url length type>` — **`length` is required**; Apple/Spotify reject
  feeds without it
- `<guid isPermaLink="false">off-protocol-ep-{n}</guid>` — **stable forever**.
  The slug is NOT a safe guid; slugs get renamed.
- `<itunes:duration>HH:MM:SS</itunes:duration>`
- `<itunes:episode>{n}</itunes:episode>`
- `<itunes:episodeType>full</itunes:episodeType>`
- `<itunes:image href="…"/>` for episode-specific art
- `<content:encoded><![CDATA[<p>…HTML show notes…</p>]]></content:encoded>`

### MDX → HTML for `<content:encoded>`

A minimal `unified` + `remark-rehype` pipeline that takes the raw MDX body
(stripped of the `header` export), treats it as plain markdown, and produces
sanitized HTML. We do **not** execute MDX as JSX for the feed — server-side
rendering React components into a podcast feed adds complexity for no
podcatcher benefit (most podcatchers strip non-trivial HTML anyway). Custom
MDX components used in show notes will not appear in podcatcher show notes;
this is acceptable.

### Stability invariants

- **`guid` never changes.** Once a guid is in the feed and a subscriber has
  it, changing it makes the podcatcher re-download the episode as new.
- **`enclosure url` should be stable.** Moving an MP3 means subscribers'
  download links 404 unless the old URL keeps redirecting.

## Subscribe links

Subscribe URLs in `SHOW.subscribe` are nullable. `SubscribeLinks` only renders
buttons for non-null entries. v1 ships with **RSS** and **generic
`podcast://`** working; Apple/Spotify/Overcast/Pocket Casts URLs are populated
as one-line edits to `episodes.ts` once those directories ingest the feed
(typically 24–72h after submission).

`SubscribeLinks` renders on both the listing page and each episode header.

## Navigation

Add `<TopLevelNavItem href="/off-protocol">Off Protocol</TopLevelNavItem>` to
`src/components/Header.tsx` between Blog and the dividers. Append the same to
`MobileNavigation.tsx`.

The header may need a breakpoint adjustment so four nav items fit comfortably.
Apply the same `hidden sm:block` (or similar) treatment used by `SDKs` if the
spacing gets tight.

## CLI tooling

`scripts/podcast.mjs` mirrors `scripts/blog.mjs` exactly — same dispatcher
pattern.

```
npm run podcast create        # interactive: scaffolds an episode
npm run podcast remove        # interactive: deletes an episode
```

### `create`

Prompts for:

1. Title
2. Slug (auto-suggested from title, editable)
3. Episode number (auto-incremented from `episodes.ts`, editable)
4. Description
5. Audio URL (CDN MP3)
6. Guests (comma-separated, optional)
7. Bluesky discussion post URL (optional, can be added later)

Then:

- `HEAD` the audio URL → fills `audioSizeBytes`, **fails if status ≠ 200**
- Probes the MP3 for duration: prefers `ffprobe` if installed, falls back to
  a pure-JS MP3 frame parser. Populates both `duration` ("HH:MM:SS") and
  `durationSeconds` so they cannot drift.
- Generates today's `pubDate` (ISO) and `date` (human) — same drift-prevention
  reasoning.
- Scaffolds the episode directory with `page.tsx`, pre-filled `en.mdx`, and
  empty `transcript.mdx`.
- Prepends the new entry to `episodes.ts` (newest first).

### `remove`

Near-copy of `remove-blog-post.mjs`. Picks an episode interactively, confirms,
deletes the directory, drops the entry from `episodes.ts`. Prompt notes that
this does NOT unpublish from podcatchers — once a guid has been distributed,
subscribers retain access on their devices.

### `validate` (deferred)

Not in v1. The launch checklist (below) provides manual coverage.

## Verification

No automated tests in v1 — adding Vitest is out of scope for this work.
Verification is manual.

### Launch checklist (before submitting to Apple/Spotify)

1. Run `npm run dev`, visit `/off-protocol/rss.xml`.
2. Validate the feed against
   [validator.podcastindex.org](https://validator.podcastindex.org/) and
   [castfeedvalidator.com](https://castfeedvalidator.com/). Both must pass.
3. Subscribe to the local feed in Pocket Casts (it accepts arbitrary URLs).
   Confirm episodes appear with title, art, duration, show notes.
4. Verify the audio plays from each episode page on desktop and mobile.
5. Verify the transcript disclosure renders and in-page Find searches inside it.
6. Verify the Bluesky discussion embed loads on episode pages with
   `blueskyPostUrl` set.
7. Verify the RSS feed is reachable only at the default locale; other locales
   301 to it.
8. Verify subscribe links appear on listing and episode pages, and that RSS
   and generic `podcast://` links work in a browser.

### High-risk surface

The RSS feed is the highest-risk surface in this work. Once subscribers exist,
a malformed feed is hard to walk back without dropping or duplicating episodes.
The launch checklist exists specifically to mitigate this.

## Documentation

The README must document:

1. Why `episodes.ts` stores both `date` and `pubDate`, and both `duration` and
   `durationSeconds` (display vs. machine; RSS spec requires specific formats).
2. The `npm run podcast create` / `remove` flow.
3. The `SHOW.subscribe` post-launch fill-in for Apple/Spotify/Overcast/Pocket
   Casts URLs.
4. The launch checklist, so future contributors know how to verify the feed
   before announcing changes.

## Open items for the implementation plan

- Exact home for the markdown→HTML pipeline (separate file vs. inlined in
  `podcast-feed.ts`)
- Exact `<details>` styling for the transcript disclosure (matches Prose?)
- Whether `MobileNavigation` needs more than just appending the link
- The `ffprobe` fallback parser — pick a small dependency or write inline
- Header breakpoint adjustments to accommodate four nav items
