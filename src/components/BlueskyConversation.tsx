'use client'

import { useEffect, useRef, useState } from 'react'
import { useSectionStore } from '@/components/SectionProvider'
import { fetchBskyPostUrl } from '@/lib/standardSite'

/**
 * The discussion section.
 *
 * `uri` is an explicit bsky.app post URL and wins outright — that's how episodes
 * and every already-published post still work, with no migration.
 *
 * `documentUri` is a standard.site document AT URI. With no `uri`, the thread is
 * resolved from that record's `bskyPostRef` in the browser, which is what lets a
 * thread be attached to an already-deployed post without a site rebuild. Nothing
 * renders until it resolves: for the window between publishing the article and
 * posting the thread there is genuinely no discussion, and an empty heading would
 * advertise one on every post that never gets a thread.
 */
export function BlueskyConversation({
  uri,
  documentUri,
  headerTemplate,
}: {
  uri?: string
  documentUri?: string
  headerTemplate?: string
}) {
  const ref = useRef<HTMLHeadingElement>(null)
  const registerHeading = useSectionStore((s) => s.registerHeading)
  const [resolvedUri, setResolvedUri] = useState<string | null>(uri ?? null)

  useEffect(() => {
    if (uri) {
      setResolvedUri(uri)
      return
    }
    if (!documentUri) return
    let cancelled = false
    fetchBskyPostUrl(documentUri).then((url) => {
      if (!cancelled && url) setResolvedUri(url)
    })
    return () => {
      cancelled = true
    }
  }, [uri, documentUri])

  useEffect(() => {
    if (resolvedUri) registerHeading({ id: 'discuss', ref, offsetRem: 6 })
  })

  useEffect(() => {
    if (!resolvedUri) return
    if (document.querySelector('script[src="/bsky-conversation.js"]')) return
    const script = document.createElement('script')
    script.src = '/bsky-conversation.js'
    document.head.appendChild(script)
  }, [resolvedUri])

  const BskyConversation = 'bsky-conversation' as any

  if (!resolvedUri) return null

  return (
    <div id="discuss" className="max-w-2xl lg:max-w-3xl px-4 md:px-16 basis-full">
      <h2 ref={ref} className="scroll-mt-24 text-2xl font-semibold text-zinc-900 dark:text-white">Discussion</h2>
      <BskyConversation uri={resolvedUri} header-template={headerTemplate} />
    </div>
  )
}
