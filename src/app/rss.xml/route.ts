import { posts } from '@/lib/posts'

const SITE_URL = 'https://atproto.com'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const items = posts
    .slice(0, 50)
    .map((post) => {
      const link = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.date).toUTCString()

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
    </item>`
    })
    .join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AT Protocol Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>News, updates, and insights from the AT Protocol team.</description>
    <language>en</language>
${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
