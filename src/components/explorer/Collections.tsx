'use client'

import { useDescribeRepo } from '@/hooks/useRepo'
import Link from 'next/link'
import Location from './Location'

interface CollectionsProps {
  repo: string
}

export default function Collections({ repo }: CollectionsProps) {
  const { data, isLoading, error } = useDescribeRepo(repo)

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          <div className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load repository collections
        </p>
      </div>
    )
  }

  if (!data || !data.collections || data.collections.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <svg
          className="mx-auto mb-3 h-12 w-12 text-gray-400 dark:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">No collections found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Location repo={repo} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Collections
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.collections.map((collection) => (
          <Link
            key={collection}
            href={`/explorer?repo=${repo}&collection=${collection}`}
            className="block rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <svg
                  className="h-5 w-5 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCollectionName(collection)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {collection}
                  </p>
                </div>
              </div>

              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function formatCollectionName(collection: string): string {
  const collectionMap: Record<string, string> = {
    'app.bsky.feed.post': 'Bluesky Posts',
    'app.bsky.feed.postgate': 'Bluesky Post Gates',
    'app.bsky.feed.threadgate': 'Bluesky Thread Gates',
    'app.bsky.feed.like': 'Bluesky Likes',
    'app.bsky.feed.repost': 'Bluesky Reposts',
    'app.bsky.graph.follow': 'Bluesky Follows',
    'app.bsky.graph.block': 'Bluesky Blocks',
    'app.bsky.graph.list': 'Bluesky Lists',
    'app.bsky.graph.listitem': 'Bluesky List Items',
    'app.bsky.graph.starterpack': 'Bluesky Starter Packs',
    'app.bsky.actor.profile': 'Bluesky Profile',
    'app.bsky.feed.generator': 'Bluesky Feed Generators',
    'chat.bsky.actor.declaration': 'Bluesky Chat Settings',
  }

  return collectionMap[collection] || collection.split('.').pop() || collection
}
