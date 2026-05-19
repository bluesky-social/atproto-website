// src/lib/episodes.ts

/**
 * Off Protocol — podcast episode data model and show metadata.
 *
 * Mirrors src/lib/posts.ts in shape and ordering convention (newest first).
 *
 * Why two date fields and two duration fields:
 *   - `date` / `duration` are human-readable strings shown on the page.
 *   - `pubDate` / `durationSeconds` are machine formats required by the
 *     RSS spec and useful for sorting / aggregation.
 *   The `npm run podcast create` script populates both in sync so they
 *   cannot drift unless edited by hand.
 */

export interface Episode {
  slug: string                  // URL slug, e.g. "ep-01-why-atproto"
  episodeNumber: number         // 1, 2, 3… for ordering + RSS <itunes:episode>
  title: string
  description: string           // 1–2 sentence summary for listing + RSS + OG
  date: string                  // human-readable, e.g. "May 7, 2026"
  pubDate: string               // ISO 8601, used for RSS <pubDate>
  duration: string              // "HH:MM:SS" — RSS spec format
  durationSeconds: number       // numeric, easier to format/sort
  guests?: string[]
  host?: string[]               // defaults to [SHOW.defaultHost] when omitted
  audioUrl: string              // absolute CDN URL to the MP3
  audioSizeBytes: number        // required by RSS <enclosure length="…">
  audioMimeType?: string        // defaults to "audio/mpeg"
  coverImage?: string           // square, ≥1400px; falls back to SHOW.coverImage
  hasShowNotes?: boolean        // author flips to true when en.mdx body has real content
  hasTranscript?: boolean       // author flips to true when transcript.mdx has real content
  explicit?: boolean            // RSS <itunes:explicit>; defaults false
  blueskyPostUrl?: string       // optional Bluesky discussion thread anchor
}

/**
 * Format a duration for HTML display: drop the hours field entirely when
 * the episode is under an hour ("58:45"), and drop the leading zero on the
 * hour when it's present ("1:06:09"). RSS uses the stored HH:MM:SS string
 * because the spec wants that format.
 */
export function formatDurationForDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export interface SubscribeUrls {
  apple: string | null
  spotify: string | null
  overcast: string | null
  pocketcasts: string | null
  rss: string | null
  generic: string
}

export interface ShowMeta {
  title: string
  description: string
  author: string
  defaultHost: string
  ownerEmail: string
  language: string
  category: string
  coverImage: string
  feedUrl: string
  siteUrl: string
  subscribe: SubscribeUrls
}

export const SHOW: ShowMeta = {
  title: 'Off Protocol',
  description: 'Conversations about AT Protocol and the open social web with the people working to build a better internet. Brought to you by the Bluesky DevRel team.',
  author: 'Bluesky DevRel',
  defaultHost: 'Jim Ray',
  ownerEmail: 'hello+atproto@blueskyweb.xyz',
  language: 'en-US',
  category: 'Technology',
  coverImage: 'https://media.atproto.com/off-protocol/off-protocol-cover.png',
  feedUrl: 'https://atproto.com/off-protocol/rss.xml',
  siteUrl: 'https://atproto.com/off-protocol',
  subscribe: {
    apple: null,                // TODO(post-launch): fill in after Apple ingestion
    spotify: null,              // TODO(post-launch): fill in after Spotify ingestion
    overcast: null,             // TODO(post-launch): fill in after Overcast ingestion
    pocketcasts: null,          // TODO(post-launch): fill in after PocketCasts ingestion
    rss: null,
    generic: 'podcast://atproto.com/off-protocol/rss.xml',
  },
}

export const episodes: Episode[] = [
  {
    slug: 'the-puppy-problem',
    episodeNumber: 5,
    title: 'The Puppy Problem',
    description:
      'Jim and Alex are live with the first live episode under the new Off Protocol name. Protocol meetups are happening everywhere, Alex and Jim were both in Portland, the Ozone moderation tool has some new features, and Bluesky is considering an edit button. Plus a few of your questions.',
    date: 'May 15, 2026',
    pubDate: '2026-05-15T12:00:00Z',
    duration: '00:33:08',
    durationSeconds: 1988,
    host: ['Jim Ray', 'Alex Garnett'],
    audioUrl: 'https://media.atproto.com/off-protocol/20260515-live/2026-05-15-off-protocol-live.mp3',
    audioSizeBytes: 63624960,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    hasTranscript: false,
  },
  {
    slug: 'why-a-new-protocol-the-history-and-future-of-at-protocol',
    episodeNumber: 4,
    title: 'Why a New Protocol? The History and Future of AT Protocol',
    description:
      "Bluesky CTO Paul Frazee and Head of Protocol Daniel Holmgren join for a wide-ranging conversation about what atproto is, why it exists, how it got built, and where it's going next. From a Twitter consultancy to an IETF working group, this is where to get started.",
    date: 'May 14, 2026',
    pubDate: '2026-05-14T12:00:00Z',
    duration: '00:59:26',
    durationSeconds: 3566,
    guests: ['Paul Frazee', 'Daniel Holmgren'],
    audioUrl: 'https://media.atproto.com/off-protocol/20260524-conversation/2026-05-14-conversation-paul-danny.mp3',
    audioSizeBytes: 114122496,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    hasTranscript: false,
  },
  {
    slug: 'blacksky-as-a-service-a-first-look-at-acorn',
    episodeNumber: 3,
    title: 'Blacksky As a Service',
    description:
      "Rishi Balakrishnan joins to talk about the work that went into building Acorn, Blacksky's new platform for creating moderated communities on atproto — and why the landing page never mentions a PDS.",
    date: 'April 24, 2026',
    pubDate: '2026-04-24T12:00:00Z',
    duration: '00:55:55',
    durationSeconds: 3355,
    guests: ['Rishi Balakrishnan'],
    audioUrl: 'https://media.atproto.com/off-protocol/20260424-live/2026-04-24-live-rishi-acorn.mp3',
    audioSizeBytes: 107389440,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    hasTranscript: false,
  },
  {
    slug: 'slowly-then-quickly-what-atmosphereconf-made-visible',
    episodeNumber: 2,
    title: 'Slowly, Then Quickly: What AtmosphereConf Made Visible',
    description:
      'With AtmosphereConf 2026 wrapped, Boris Mann and Ted Han join to talk about what the gathering surfaced in the ecosystem. From the IETF working group, the move beyond a single foundation, to a growing layer of co-ops, regional meetups, and independent stewards.',
    date: 'April 20, 2026',
    pubDate: '2026-04-20T12:00:00Z',
    duration: '01:06:09',
    durationSeconds: 3969,
    guests: ['Boris Mann', 'Ted Han'],
    audioUrl: 'https://media.atproto.com/off-protocol/20260410-live/2026-04-10-live-boris-ted.mp3',
    audioSizeBytes: 127011840,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    hasTranscript: false,
  },
  {
    slug: 'a-thousand-prs-in-two-weeks-building-npmx',
    episodeNumber: 1,
    title: 'A Thousand PRs in Two Weeks',
    description:
      'Daniel Roe, Matias Capeletto, and Zeu join to discuss how their frustration with JavaScript packaging went from a Bluesky post to one of the most successful new community-led projects on the protocol.',
    date: 'February 27, 2026',
    pubDate: '2026-02-27T12:00:00Z',
    duration: '00:58:45',
    durationSeconds: 3525,
    guests: ['Daniel Roe', 'Matias Capeletto', 'Zeu'],
    audioUrl: 'https://media.atproto.com/off-protocol/20260227-live/2026-02-27-npmx-team.mp3',
    audioSizeBytes: 112814592,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    hasTranscript: false,
  },
  // newest first; populate via `npm run podcast create`
]
