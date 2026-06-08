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
  stripMdxFrontmatter,
} from '@/lib/podcast-feed-content'

async function loadEpisodeContentHtml(slug: string): Promise<string> {
  // Show notes live alongside the episode pages under [locale]; we always
  // read the English MDX for the (English-only) feed.
  const mdxPath = path.join(
    process.cwd(),
    'src',
    'app',
    '[locale]',
    'off-protocol',
    slug,
    'en.mdx',
  )
  try {
    const raw = await fs.readFile(mdxPath, 'utf-8')
    const body = stripMdxFrontmatter(raw)
    return await mdxBodyToHtml(body)
  } catch {
    return '<p></p>'
  }
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function resolveContentHtml(episode: Episode): Promise<string> {
  // When the author hasn't published real show notes yet, fall back to the
  // episode description so podcatchers still have meaningful copy.
  if (!episode.hasShowNotes) {
    return `<p>${xmlEscape(episode.description)}</p>`
  }
  return loadEpisodeContentHtml(episode.slug)
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
      contentHtml: await resolveContentHtml(e),
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
