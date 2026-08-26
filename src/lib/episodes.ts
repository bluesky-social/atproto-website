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

import type { EpisodeFormat } from './episodeFormat.mjs'

export interface Episode {
  slug: string                  // URL slug, e.g. "ep-01-why-atproto"
  episodeNumber: number         // 1, 2, 3… for ordering + RSS <itunes:episode>
  title: string
  description: string           // 1–2 sentence summary for listing + RSS + OG
  date: string                  // human-readable, e.g. "May 7, 2026"
  pubDate: string               // ISO 8601, used for RSS <pubDate>
  duration: string              // "HH:MM:SS" — RSS spec format
  durationSeconds: number       // numeric, easier to format/sort
  guests?: string[]             // rendered on the episode listing page
  format: EpisodeFormat         // conversation | livestream | ama — badged in the listing
  audioUrl: string              // absolute CDN URL to the MP3
  audioSizeBytes: number        // required by RSS <enclosure length="…">
  audioMimeType?: string        // defaults to "audio/mpeg"
  coverImage?: string           // square, ≥1400px; falls back to SHOW.coverImage
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

/**
 * The hosts to display for an episode: the given `hosts` when non-empty,
 * otherwise the show default ([SHOW.defaultHost], i.e. ['Jim Ray']). Hosts live
 * only in the MDX episode header (the byline is the only consumer), so this
 * takes a plain shape rather than an Episode field. An empty array is treated
 * as absent — the studio's hosts field can be cleared, and a blank byline is
 * never what's wanted.
 */
export function resolveHosts(episode: { hosts?: string[] }): string[] {
  return episode.hosts?.length ? episode.hosts : [SHOW.defaultHost]
}

export interface SubscribeUrls {
  // Directory URLs populated post-launch, once each service has ingested
  // the feed. Other dropdown options (Overcast, Pocket Casts, Castro, RSS)
  // are derived from the feed URL at render time, no config needed.
  apple: string | null
  spotify: string | null
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
  ownerEmail: 'atmosphere@blueskyweb.xyz',
  language: 'en-US',
  category: 'Technology',
  coverImage: 'https://media.atproto.com/off-protocol/off-protocol-cover.png',
  feedUrl: 'https://atproto.com/off-protocol/rss.xml',
  siteUrl: 'https://atproto.com/off-protocol',
  subscribe: {
    apple: null,                // TODO(post-launch): fill in after Apple ingestion
    spotify: null,              // TODO(post-launch): fill in after Spotify ingestion
  },
}

export const episodes: Episode[] = [
  {
    slug: '2026-08-26-toni-schneider-ama',
    episodeNumber: 18,
    title: 'Not Just Us: An AMA with Toni Schneider',
    description: 'Bluesky CEO Toni Schneider sits down to answer your questions about composable moderation, how Bluesky (and the Atmosphere) plans to make money, what makes atproto spaces a true differentiator, and where AI fits on the protocol.',
    date: 'August 26, 2026',
    pubDate: '2026-08-26T15:30:00.000Z',
    duration: '00:47:19',
    durationSeconds: 2839,
    guests: ['Toni Schneider'],
    format: 'ama',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-08-26-toni-schneider/2026-08-25-toni-ama-lev-18lufs.mp3',
    audioSizeBytes: 56899255,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: '2026-08-24-jim-calabro-ama',
    episodeNumber: 17,
    title: 'Own Your Own Destiny: An AMA with Jim Calabro',
    description: 'Jim Calabro, Head of Platform at Bluesky, joins to answer your questions about running what is, for now, the biggest node on the atproto network',
    date: 'August 24, 2026',
    pubDate: '2026-08-24T21:32:59.896Z',
    duration: '00:47:08',
    durationSeconds: 2828,
    guests: ['Jim Calabro'],
    format: 'ama',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-08-24-jim-calabro/2026-08-19-jim-calabro-ama.mp3',
    audioSizeBytes: 45352801,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: '2026-08-17-waterwheel-logic-eve-osman',
    episodeNumber: 16,
    title: 'Waterwheel Logic',
    description: 'Eve Osman on building Northsky, creating a love letter to the web with Twinkl, approaches to private data on the protocol, and why a Nubian waterwheel is a model for building sustainable technology.',
    date: 'August 17, 2026',
    pubDate: '2026-08-17T19:51:29.519Z',
    duration: '00:57:08',
    durationSeconds: 3428,
    guests: ['Eve Osman'],
    format: 'conversation',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-08-17-eve-osman/2026-07-30-eve-osman.mp3',
    audioSizeBytes: 54956300,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: '2026-08-06-shinkansen-mindset',
    episodeNumber: 15,
    title: 'Shinkansen Mindset',
    description: 'News from the Atmosphere, including Bluesky CEO Toni Schneider’s interview with Nilay Patel at The Verge, three big referece PDS improvements shipping very soon, an atlas of Atmospheric apps, and more. (Livestream, recorded August 5, 2026)',
    date: 'August 6, 2026',
    pubDate: '2026-08-06T18:29:32.485Z',
    duration: '00:47:34',
    durationSeconds: 2854,
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-08-06-live/2026-08-05-livestream.mp3',
    audioSizeBytes: 22944954,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: '2026-08-03-designing-for-uncertainty-ethan-marcotte',
    episodeNumber: 14,
    title: 'Designing for Uncertainty',
    description: 'Ethan Marcotte, who first coined the phrase Responsive Design, joins to discuss how to operate in a world defined by uncertainty.',
    date: 'August 3, 2026',
    pubDate: '2026-08-03T12:00:00.000Z',
    duration: '00:44:37',
    durationSeconds: 2677,
    guests: ['Ethan Marcotte'],
    format: 'conversation',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-07-31-2026-07-31-design-for-uncertainty-ethan-marcotte/2026-07-31-design-for-uncertainty-ethan-marcotte.mp3',
    audioSizeBytes: 21523467,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: '2026-07-23-livestream-protocolly-atmoseed',
    episodeNumber: 13,
    title: 'Protocolly Atmoseed',
    description: 'News from around the Atmosphere, including a proposal to fix localhost, more webdevs getting into atproto, Mu Social’s opinionated news feed, and more.',
    date: 'July 23, 2026',
    pubDate: '2026-07-23T16:38:42.556Z',
    duration: '00:36:02',
    durationSeconds: 2162,
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-07-22-live-protocolly-atmoseed/2026-07-23-livestream-protocolly-atmoseed.mp3',
    audioSizeBytes: 17403717,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: '2026-07-22-erin-kissane',
    episodeNumber: 12,
    title: '“Nothing Is Ever Over”',
    description: 'Writer, speaker, and researcher Erin Kissane joins Jim to trace how the social internet got here, what’s worth salvaging, and how we can do better by listening to people.',
    date: 'July 22, 2026',
    pubDate: '2026-07-22T15:33:23.353Z',
    duration: '01:16:25',
    durationSeconds: 4585,
    guests: ['Erin Kissane'],
    format: 'conversation',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-07-22-erin-kissane/2026-07-22-erin-kissane.mp3',
    audioSizeBytes: 36790000,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'network-in-your-hand',
    episodeNumber: 11,
    title: 'Sometimes You Just Want to Hold the Entire Network in Your Hand',
    description: 'Jim and Alex are back on the livestream. The permissioned data proposal has shipped, updates from Tangled, Roomy, and Anisota, and a look ahead at Jetstream v2.',
    date: 'July 8, 2026',
    pubDate: '2026-07-10T02:05:39.456Z',
    duration: '00:33:20',
    durationSeconds: 2000,
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-07-08-live/2026-07-08.mp3',
    audioSizeBytes: 16105595,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'ama-dholms-irons-still-hot',
    episodeNumber: 10,
    title: 'The Iron’s Still Hot',
    description: 'Daniel Holmgren joins the livestream for an AMA on permissioned data.',
    date: 'June 25, 2026',
    pubDate: '2026-06-26T01:16:18.447Z',
    duration: '00:46:35',
    durationSeconds: 2794,
    guests: ['Daniel Holmgren'],
    format: 'ama',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-06-24-ama-dholms/2020-06-24-dholms-ama.mp3',
    audioSizeBytes: 22464670,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'roost-v1-juliet-shen',
    episodeNumber: 9,
    title: '“Policy Without Tools Is Just Poetry”',
    description: 'Juliet Shen from ROOST joins the show to talk through the Coop 1.0 release, what open-source trust and safety unlocks for new builders, and where AI actually belongs in moderation',
    date: 'June 16, 2026',
    pubDate: '2026-06-16T21:19:48.973Z',
    duration: '00:19:43',
    durationSeconds: 1182,
    guests: ['Juliet Shen'],
    format: 'conversation',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-06-16-juliet-shen/2026-06-16-juliet-shen.mp3',
    audioSizeBytes: 9572516,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'cobblers-kids',
    episodeNumber: 8,
    title: 'The Cobbler’s Kids',
    description: 'Jim and Alex are back on the livestream at a new time to discuss personal websites, Coop 1.0, exciting announcements from Eurosky, a new OAuth scope builder, and more news from the Atmosphere.',
    date: 'June 15, 2026',
    pubDate: '2026-06-15T21:24:51.805Z',
    duration: '00:40:20',
    durationSeconds: 2419,
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-06-10-live/2026-06-10-live-jim-alex.mp3',
    audioSizeBytes: 19470143,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'in-our-timeline',
    episodeNumber: 7,
    title: 'In Our Timeline',
    description: 'Paul and Daniel are on the livestream this week with a look at the new Standard.site integration, updates from permissioned data, and news from around the Atmosphere',
    date: 'May 29, 2026',
    pubDate: '2026-06-11T20:00:18.291Z',
    duration: '00:46:29',
    durationSeconds: 2789,
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/2026-05-29-live/2026-05-29-live-paul-daniel.mp3',
    audioSizeBytes: 22320651,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'do-this-together-standard-site',
    episodeNumber: 6,
    title: 'Why Don’t We Just Do This Together?',
    description: 'Jim sits down with members of the core team building and governing Standard.site, the shared Lexicon for publishing longform writing on atproto. Brooke from pckt.blog, Jared from Leaflet, and Miguel from Offprint cover the design tradeoffs in creating a new shared format, tales of data migrations, strategies for shared governance, and why you shouldn’t buy a premium domain name.',
    date: 'May 28, 2026',
    pubDate: '2026-05-28T17:30:10.563Z',
    duration: '01:04:11',
    durationSeconds: 3851,
    guests: ['Brooke', 'Jared', 'Miguel'],
    format: 'conversation',
    audioUrl: 'https://media.atproto.com/off-protocol/20260528-conversation-standard-site/2026-05-28-conversation-standard-site.mp3',
    audioSizeBytes: 123247872,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'the-puppy-problem',
    episodeNumber: 5,
    title: 'The Puppy Problem',
    description: 'Jim and Alex are live with the first live episode under the new Off Protocol name. Protocol meetups are happening everywhere, Alex and Jim were both in Portland, the Ozone moderation tool has some new features, and Bluesky is considering an edit button. Plus a few of your questions.',
    date: 'May 15, 2026',
    pubDate: '2026-05-15T12:00:00Z',
    duration: '00:33:08',
    durationSeconds: 1988,
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/20260515-live/2026-05-15-off-protocol-live.mp3',
    audioSizeBytes: 63624960,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'why-a-new-protocol-the-history-and-future-of-at-protocol',
    episodeNumber: 4,
    title: 'Why a New Protocol? The History and Future of AT Protocol',
    description: 'Bluesky CTO Paul Frazee and Head of Protocol Daniel Holmgren join for a wide-ranging conversation about what atproto is, why it exists, how it got built, and where it’s going next. From a Twitter consultancy to an IETF working group, this is where to get started.',
    date: 'May 14, 2026',
    pubDate: '2026-05-14T12:00:00Z',
    duration: '00:59:26',
    durationSeconds: 3566,
    guests: ['Paul Frazee', 'Daniel Holmgren'],
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/20260524-conversation/2026-05-14-conversation-paul-danny.mp3',
    audioSizeBytes: 114122496,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'blacksky-as-a-service-a-first-look-at-acorn',
    episodeNumber: 3,
    title: 'Blacksky As a Service',
    description: 'Rishi Balakrishnan joins to talk about the work that went into building Acorn, Blacksky’s new platform for creating moderated communities on atproto — and why the landing page never mentions a PDS.',
    date: 'April 24, 2026',
    pubDate: '2026-04-24T12:00:00Z',
    duration: '00:55:55',
    durationSeconds: 3355,
    guests: ['Rishi Balakrishnan'],
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/20260424-live/2026-04-24-live-rishi-acorn.mp3',
    audioSizeBytes: 107389440,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'slowly-then-quickly-what-atmosphereconf-made-visible',
    episodeNumber: 2,
    title: 'Slowly, Then Quickly: What AtmosphereConf Made Visible',
    description: 'With AtmosphereConf 2026 wrapped, Boris Mann and Ted Han join to talk about what the gathering surfaced in the ecosystem. From the IETF working group, the move beyond a single foundation, to a growing layer of co-ops, regional meetups, and independent stewards.',
    date: 'April 20, 2026',
    pubDate: '2026-04-20T12:00:00Z',
    duration: '01:06:09',
    durationSeconds: 3969,
    guests: ['Boris Mann', 'Ted Han'],
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/20260410-live/2026-04-10-live-boris-ted.mp3',
    audioSizeBytes: 127011840,
    audioMimeType: 'audio/mpeg',
  },
  {
    slug: 'a-thousand-prs-in-two-weeks-building-npmx',
    episodeNumber: 1,
    title: 'A Thousand PRs in Two Weeks',
    description: 'Daniel Roe, Matias Capeletto, and Zeu join to discuss how their frustration with JavaScript packaging went from a Bluesky post to one of the most successful new community-led projects on the protocol.',
    date: 'February 27, 2026',
    pubDate: '2026-02-27T12:00:00Z',
    duration: '00:58:45',
    durationSeconds: 3525,
    guests: ['Daniel Roe', 'Matias Capeletto', 'Zeu'],
    format: 'livestream',
    audioUrl: 'https://media.atproto.com/off-protocol/20260227-live/2026-02-27-npmx-team.mp3',
    audioSizeBytes: 112814592,
    audioMimeType: 'audio/mpeg',
  },
  // newest first; populate via `npm run podcast create`
]
