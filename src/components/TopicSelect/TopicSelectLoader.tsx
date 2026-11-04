'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { topicSelectHref } from './topicHref'

// The form is server-rendered. Enhance changes with Next navigation so the
// surrounding site stays mounted; without JS the form still submits normally.
export function TopicSelectLoader() {
  const router = useRouter()
  useEffect(() => {
    function navigate(event: Event) {
      const element = event.target
      if (
        !(element instanceof HTMLElement) ||
        element.localName !== 'topic-select'
      )
        return
      const select = element.querySelector('select')
      if (select) router.push(topicSelectHref(select.value), { scroll: false })
    }
    document.addEventListener('topic-select:change', navigate)
    import('./topic-select')
    return () => document.removeEventListener('topic-select:change', navigate)
  }, [router])
  return null
}
