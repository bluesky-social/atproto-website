'use client'

import { useEffect, useId, useState } from 'react'
import { useTheme } from 'next-themes'

const EMBED_ORIGIN = 'https://embed.bsky.app'

// The official embed widget (blockquote + embed.bsky.app/static/embed.js)
// builds its iframe without a `colorMode`, and the embed defaults to light, so
// the card stayed white on our dark theme. Building the same iframe ourselves
// lets us pass `colorMode` from the site theme. Height arrives from the embed
// via postMessage, matched on the `id` query param.
//
// Don't be tempted to set `color-scheme` on the iframe to match: the embed
// themes itself by toggling a light/dark class on its root and never declares
// `color-scheme` there, so its root stays `normal`. A browser only leaves an
// iframe's canvas transparent while the iframe element's color scheme matches
// the embedded root's — declaring one here forces an opaque light canvas that
// shows through the card's rounded corners as white notches.
export function BlueskyPostClient({ uri }: { uri: string }) {
  const { resolvedTheme } = useTheme()
  const id = useId()
  const [height, setHeight] = useState(260)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== EMBED_ORIGIN) return
      if (event.data?.id === id && event.data.height) {
        setHeight(event.data.height)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [id])

  const colorMode = resolvedTheme === 'dark' ? 'dark' : 'light'
  const params = new URLSearchParams({ id, colorMode })

  // The iframe's canvas is painted opaque white and we can't reach into the
  // embed to change that, so the card's rounded corners sit on white notches —
  // invisible against a light page, glaring against a dark one. Clipping in
  // this document is the only lever we have. 32px is the embed card's own
  // radius (`rounded-[32px]` on its outer container, which carries a 2px
  // border; the +4 the embed adds to its reported height covers those borders,
  // so the card fills the iframe box exactly and this clip lands on the card
  // edge). If the corners ever look off, re-check that radius upstream.
  return (
    <div
      className="not-prose my-6 w-full max-w-[600px] overflow-hidden rounded-[32px]"
      style={{ height }}
    >
      {/* The theme isn't known until hydration, so hold the iframe back rather
          than load it light and reload it dark a frame later. Keying on the
          theme swaps the element out on a toggle — pointing an existing iframe
          at a new src would push onto session history and hijack Back. */}
      {mounted && (
        <iframe
          key={colorMode}
          src={`${EMBED_ORIGIN}/embed/${uri.slice('at://'.length)}?${params}`}
          title="Bluesky post"
          scrolling="no"
          loading="lazy"
          style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
        />
      )}
    </div>
  )
}
