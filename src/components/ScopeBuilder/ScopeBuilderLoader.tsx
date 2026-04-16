'use client'

import { useEffect, useState } from 'react'

export function ScopeBuilderLoader() {
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    import('./registerElements').then(() => setRegistered(true))
  }, [])

  if (!registered) {
    return (
      <div className="my-8 rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Loading scope builder…
      </div>
    )
  }

  return (
    <>
      <scope-builder></scope-builder>
      <permission-author></permission-author>
    </>
  )
}
