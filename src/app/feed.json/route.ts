import { posts } from '@/lib/posts'

const SITE_URL = 'https://atproto.com'

export async function GET() {
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'AT Protocol Blog',
    home_page_url: `${SITE_URL}/blog`,
    feed_url: `${SITE_URL}/feed.json`,
    description: 'News, updates, and insights from the AT Protocol team.',
    language: 'en',
    items: posts.slice(0, 50).map((post) => ({
      id: `${SITE_URL}/blog/${post.slug}`,
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      summary: post.description,
      date_published: new Date(post.date).toISOString(),
      ...(post.author
        ? { authors: [{ name: post.author }] }
        : {}),
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
    },
  })
}
