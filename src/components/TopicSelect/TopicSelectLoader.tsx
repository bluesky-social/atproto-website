'use client'

import { useEffect } from 'react'

// Registers <topic-select> in the browser. Renders nothing: the form itself
// is server-rendered and works before (or without) this runs.
export function TopicSelectLoader() {
  useEffect(() => {
    import('./topic-select')
  }, [])
  return null
}
