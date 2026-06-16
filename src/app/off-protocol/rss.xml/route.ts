// src/app/off-protocol/rss.xml/route.ts
//
// Lives OUTSIDE the [locale] segment because:
//   1. Podcatchers expect a single canonical feed URL (no /{locale}/ prefix).
//   2. The i18n middleware matcher in src/middleware.js excludes paths
//      containing ".", so /{locale}/off-protocol/rss.xml is not reachable
//      at the bare /off-protocol/rss.xml URL anyway.
import * as fs from 'fs/promises'
import * as path from 'path'
import { episodes, SHOW, type Episode } from '@/lib/episodes'
import { buildPodcastFeed, type FeedEpisode } from '@/lib/podcast-feed'
import {
  mdxBodyToHtml,
  readShowNotesFlag,
  stripMdxFrontmatter,
} from '@/lib/podcast-feed-content'

// Show notes live alongside the episode pages under [locale]; we always read
// the English MDX for the (English-only) feed.
function episodeMdxPath(slug: string): string {
  return path.join(
    process.cwd(),
    'src',
    'app',
    '[locale]',
    'off-protocol',
    slug,
    'en.mdx',
  )
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// The MDX header is the single source of truth for whether real show notes
// exist; derive both the flag and the rendered notes from that one file so the
// feed and the episode page can never disagree. <content:encoded> gets the
// notes when present, otherwise the episode summary as a fallback.
async function resolveFeedFields(
  episode: Episode,
): Promise<{ hasShowNotes: boolean; contentHtml: string }> {
  const summaryHtml = `<p>${xmlEscape(episode.description)}</p>`
  let raw: string
  try {
    raw = await fs.readFile(episodeMdxPath(episode.slug), 'utf-8')
  } catch {
    return { hasShowNotes: false, contentHtml: summaryHtml }
  }
  if (!readShowNotesFlag(raw)) {
    return { hasShowNotes: false, contentHtml: summaryHtml }
  }
  return {
    hasShowNotes: true,
    contentHtml: await mdxBodyToHtml(stripMdxFrontmatter(raw)),
  }
}

// Behind a reverse proxy (Render, Cloudflare Pages, Vercel, etc.), the
// Node process is bound to an internal address while the public hostname
// arrives via X-Forwarded-Host. Honor that header when present so the feed
// self-references the public URL rather than the container's localhost.
function deriveOrigin(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') ?? 'https'
    return `${proto}://${forwardedHost}`
  }
  return new URL(request.url).origin
}

export async function GET(request: Request) {
  const origin = deriveOrigin(request)
  const show = {
    ...SHOW,
    siteUrl: `${origin}/off-protocol`,
    feedUrl: `${origin}/off-protocol/rss.xml`,
  }

  const feedEpisodes: FeedEpisode[] = await Promise.all(
    episodes.map(async (e) => ({
      ...e,
      ...(await resolveFeedFields(e)),
    })),
  )

  const xml = buildPodcastFeed(show, feedEpisodes)

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
