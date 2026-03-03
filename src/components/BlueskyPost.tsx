import { BlueskyPostClient } from './BlueskyPostClient'

export async function BlueskyPost({ url }: { url: string }) {
  try {
    const res = await fetch(
      `https://embed.bsky.app/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    // Strip the <script> tag — the client component loads it explicitly
    // so it runs after the blockquote is in the DOM
    const html = data.html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .trim()
    return <BlueskyPostClient html={html} />
  } catch {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    )
  }
}
