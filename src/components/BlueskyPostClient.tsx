'use client'

import { useEffect } from 'react'

const EMBED_SCRIPT = 'https://embed.bsky.app/static/embed.js'

export function BlueskyPostClient({ html }: { html: string }) {
  useEffect(() => {
    // Load embed.js so it can convert the blockquote to the full styled iframe.
    // Check first so multiple embeds on the same page only load the script once.
    if (!document.querySelector(`script[src="${EMBED_SCRIPT}"]`)) {
      const script = document.createElement('script')
      script.src = EMBED_SCRIPT
      script.async = true
      script.setAttribute('charset', 'utf-8')
      document.body.appendChild(script)
    }
  }, [])

  return (
    <div
      className="my-6 not-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
