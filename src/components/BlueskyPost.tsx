import { BlueskyPostClient } from './BlueskyPostClient'

export async function BlueskyPost({ url }: { url: string }) {
  try {
    const res = await fetch(
      `https://embed.bsky.app/oembed?url=${encodeURIComponent(url)}&format=json`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) throw new Error()
    const data = await res.json()
    // We only want the resolved at:// URI out of the oembed snippet — the
    // embed iframe is addressed by DID, while a bsky.app URL may carry a
    // handle. The rest of the snippet is markup for embed.js, which we don't
    // use (see BlueskyPostClient).
    const uri = /data-bluesky-uri="(at:\/\/[^"]+)"/.exec(data.html)?.[1]
    if (!uri) throw new Error()
    return <BlueskyPostClient uri={uri} />
  } catch {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    )
  }
}
