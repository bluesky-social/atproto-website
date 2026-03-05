'use client'

import { useEffect } from 'react'

export function BlueskyConversation({ uri }: { uri: string }) {
  useEffect(() => {
    if (document.querySelector('script[src="/bsky-conversation.js"]')) return
    const script = document.createElement('script')
    script.src = '/bsky-conversation.js'
    document.head.appendChild(script)
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BskyConversation = 'bsky-conversation' as any

  return (
    <div className="not-prose mx-auto w-full max-w-2xl px-4 py-12">
      <BskyConversation uri={uri} />
    </div>
  )
}
