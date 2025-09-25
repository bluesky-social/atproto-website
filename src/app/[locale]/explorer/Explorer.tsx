'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Collections from '@/components/explorer/Collections'
import Collection from '@/components/explorer/Collection'
import Record from '@/components/explorer/Record'
import Link from 'next/link'

export default function Explorer({}: {}) {
  return (
    <Suspense fallback={<div>...</div>}>
      <Inner />
    </Suspense>
  )
}

function Inner() {
  const username = 'pfrazee.com'
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  const params = useSearchParams()
  const repo = params.get('repo') || ''
  const collection = params.get('collection') || ''
  const rkey = params.get('rkey') || ''

  return (
    <div className="mx-auto max-w-7xl p-4">
      <QueryClientProvider client={queryClient}>
        <h1 className="mb-1 text-3xl font-bold">Network Explorer</h1>
        {rkey ? (
          <Record repo={repo} collection={collection} rkey={rkey} />
        ) : collection ? (
          <Collection repo={repo} collection={collection} />
        ) : repo ? (
          <Collections repo={repo} />
        ) : (
          <DefaultView />
        )}
      </QueryClientProvider>
    </div>
  )
}

function DefaultView() {
  const [url, setUrl] = useState('')
  return (
    <div>
      <div className="flex flex-1 items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
        <input
          type="text"
          placeholder="atproto.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
          autoFocus
        />
      </div>
      <div className="flex flex-row gap-2">
        <div>Suggested repos:</div>
        {['atproto.com', 'bsky.app', 'nytimes.com'].map((repo) => (
          <div key={repo}>
            <Link
              className="text-blue-600 dark:text-blue-400"
              href={`/explorer?repo=${repo}`}
            >
              {repo}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
