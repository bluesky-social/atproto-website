'use client'

import { useEffect, useRef } from 'react'
import { useSectionStore } from '@/components/SectionProvider'

export function BlueskyConversation({ uri, headerTemplate }: { uri: string; headerTemplate?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  const registerHeading = useSectionStore((s) => s.registerHeading)

  useEffect(() => {
    registerHeading({ id: 'discuss', ref, offsetRem: 6 })
  })

  useEffect(() => {
    if (document.querySelector('script[src="/bsky-conversation.js"]')) return
    const script = document.createElement('script')
    script.src = '/bsky-conversation.js'
    document.head.appendChild(script)
  }, [])

  const BskyConversation = 'bsky-conversation' as any

  return (
    <div id="discuss" className="max-w-2xl lg:max-w-3xl px-4 md:px-16 basis-full">
      <h2 ref={ref} className="scroll-mt-24 text-2xl font-semibold text-zinc-900 dark:text-white">Discussion</h2>
      <BskyConversation uri={uri} header-template={headerTemplate} />
    </div>
  )
}
