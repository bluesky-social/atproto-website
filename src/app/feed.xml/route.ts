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
  const updated = new Date(posts[0].date).toISOString()

  const entries = posts
    .slice(0, 50)
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const published = new Date(post.date).toISOString()

      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${url}" rel="alternate"/>
    <id>${url}</id>
    <published>${published}</published>
    <updated>${published}</updated>
    <summary>${escapeXml(post.description)}</summary>
  </entry>`
    })
    .join('\n')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AT Protocol Blog</title>
  <link href="${SITE_URL}/blog" rel="alternate"/>
  <link href="${SITE_URL}/feed.xml" rel="self" type="application/atom+xml"/>
  <id>${SITE_URL}/blog</id>
  <updated>${updated}</updated>
  <subtitle>News, updates, and insights from the AT Protocol team.</subtitle>
${entries}
</feed>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  })
}
