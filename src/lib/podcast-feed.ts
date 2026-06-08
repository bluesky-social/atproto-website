// src/lib/podcast-feed.ts
import type { Episode, ShowMeta } from './episodes'

/**
 * Build a complete RSS 2.0 + iTunes podcast feed XML document from
 * show metadata and an episodes array.
 *
 * All values are XML-escaped. <content:encoded> is wrapped in CDATA and
 * is the caller's responsibility to render to HTML beforehand (see
 * mdxBodyToHtml in podcast-feed-content.ts).
 *
 * GUID stability: episode GUIDs are `off-protocol-ep-{episodeNumber}`.
 * They must never change once distributed; renaming an episode slug is
 * fine, but the GUID stays put.
 */

export interface FeedEpisode extends Episode {
  /** HTML-rendered show notes; placed in <content:encoded> CDATA. */
  contentHtml: string
}

const ITUNES_NS = 'http://www.itunes.com/dtds/podcast-1.0.dtd'
const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/'
const ATOM_NS = 'http://www.w3.org/2005/Atom'

interface RenderCtx {
  show: ShowMeta
  origin: string
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdataSafe(html: string): string {
  // CDATA cannot contain the literal "]]>" — split it if present.
  return html.replace(/\]\]>/g, ']]]]><![CDATA[>')
}

function toRfc822(isoDate: string): string {
  // RSS <pubDate> uses RFC 822 dates. JS toUTCString() is RFC 1123,
  // which is RFC 822-compatible for podcatchers.
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) {
    throw new Error(`podcast-feed: invalid pubDate ${JSON.stringify(isoDate)}`)
  }
  return d.toUTCString()
}

function episodeGuid(episode: Episode): string {
  // STABLE FOREVER. Do not derive from slug, title, or audioUrl.
  return `off-protocol-ep-${episode.episodeNumber}`
}

function episodeUrl(show: ShowMeta, episode: Episode): string {
  return `${show.siteUrl}/${episode.slug}`
}

// Resolve a possibly-relative URL against the show's origin. Absolute URLs
// (e.g., R2-hosted cover art) pass through unchanged; relative paths get
// prefixed. Important because cover URLs can be either form.
function absUrl(origin: string, url: string): string {
  return url.startsWith('http') ? url : `${origin}${url}`
}

function renderItem(ctx: RenderCtx, episode: FeedEpisode): string {
  if (!Number.isInteger(episode.audioSizeBytes) || episode.audioSizeBytes <= 0) {
    throw new Error(
      `podcast-feed: ep ${episode.episodeNumber} has invalid audioSizeBytes (${episode.audioSizeBytes})`,
    )
  }

  const { show, origin } = ctx
  const mime = episode.audioMimeType ?? 'audio/mpeg'
  const cover = absUrl(origin, episode.coverImage ?? show.coverImage)

  return `    <item>
      <title>${xmlEscape(episode.title)}</title>
      <link>${xmlEscape(episodeUrl(show, episode))}</link>
      <description>${xmlEscape(episode.description)}</description>
      <enclosure url="${xmlEscape(episode.audioUrl)}" length="${episode.audioSizeBytes}" type="${xmlEscape(mime)}"/>
      <guid isPermaLink="false">${xmlEscape(episodeGuid(episode))}</guid>
      <pubDate>${xmlEscape(toRfc822(episode.pubDate))}</pubDate>
      <itunes:duration>${xmlEscape(episode.duration)}</itunes:duration>
      <itunes:episode>${episode.episodeNumber}</itunes:episode>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:explicit>${episode.explicit ? 'true' : 'false'}</itunes:explicit>
      <itunes:image href="${xmlEscape(cover)}"/>
      <content:encoded><![CDATA[${cdataSafe(episode.contentHtml)}]]></content:encoded>
    </item>`
}

export function buildPodcastFeed(show: ShowMeta, episodes: FeedEpisode[]): string {
  const normalizedShow: ShowMeta = {
    ...show,
    siteUrl: show.siteUrl.replace(/\/$/, ''),
  }
  const origin = new URL(normalizedShow.siteUrl).origin
  const ctx: RenderCtx = { show: normalizedShow, origin }

  const items = episodes.map((e) => renderItem(ctx, e)).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="${ITUNES_NS}"
     xmlns:content="${CONTENT_NS}"
     xmlns:atom="${ATOM_NS}">
  <channel>
    <title>${xmlEscape(normalizedShow.title)}</title>
    <link>${xmlEscape(normalizedShow.siteUrl)}</link>
    <description>${xmlEscape(normalizedShow.description)}</description>
    <language>${xmlEscape(normalizedShow.language)}</language>
    <itunes:author>${xmlEscape(normalizedShow.author)}</itunes:author>
    <itunes:owner>
      <itunes:name>${xmlEscape(normalizedShow.author)}</itunes:name>
      <itunes:email>${xmlEscape(normalizedShow.ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:image href="${xmlEscape(absUrl(origin, normalizedShow.coverImage))}"/>
    <itunes:category text="${xmlEscape(normalizedShow.category)}"/>
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
    <atom:link href="${xmlEscape(normalizedShow.feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}
