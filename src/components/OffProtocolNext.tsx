'use client'

import { useEffect } from 'react'

/**
 * Mounts the <off-protocol-next> web component, which fetches the next
 * upcoming Off Protocol livestream from the atproto.com repo and renders a
 * card with a live countdown. The component hides itself when nothing is
 * scheduled. Logic lives in /public/off-protocol/ (vanilla JS + tests).
 */
export function OffProtocolNext() {
  useEffect(() => {
    if (document.querySelector('script[data-off-protocol-next]')) return
    const script = document.createElement('script')
    script.type = 'module'
    script.src = '/off-protocol/widget.mjs'
    script.setAttribute('data-off-protocol-next', '')
    document.head.appendChild(script)
  }, [])

  const OffProtocolNextEl = 'off-protocol-next' as any

  return <OffProtocolNextEl />
}
