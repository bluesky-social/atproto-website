'use client'

import { useEffect, useRef } from 'react'

export function BlueskyConversation({ uri }: { uri: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Dynamically load the web component script once
    if (!customElements.get('bsky-conversation')) {
      const script = document.createElement('script')
      script.src = '/bsky-conversation.js'
      document.head.appendChild(script)
    }

    // Create the custom element
    const el = document.createElement('bsky-conversation')
    el.setAttribute('uri', uri)
    containerRef.current.appendChild(el)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [uri])

  return <div ref={containerRef} className="not-prose mx-auto w-full max-w-2xl px-4 py-12" />
}
