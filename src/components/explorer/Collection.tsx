'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useListRecords } from '@/hooks/useRepo'
import Location from './Location'

interface CollectionProps {
  repo: string
  collection: string
}

export default function Collection({ repo, collection }: CollectionProps) {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const { data, isLoading, error } = useListRecords({
    repo,
    collection,
    limit: 50,
    cursor,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-4 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded bg-gray-200 dark:bg-gray-700"
            ></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load collection records
        </p>
      </div>
    )
  }

  if (!data || !data.records || data.records.length === 0) {
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          No records found in this collection
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Location repo={repo} collection={collection} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatCollectionName(collection)}
        </h3>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-8">
              <span>Name</span>
              <span>Type</span>
            </div>
            <div className="flex items-center space-x-8">
              <span>Size</span>
              <span>Modified</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.records.map((record) => (
            <Link
              key={record.uri}
              href={`/explorer?repo=${repo}&collection=${collection}&rkey=${getRecordKey(record.uri)}`}
              className="block transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex min-w-0 flex-1 items-center space-x-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {getRecordPreview(record.value)}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {getRecordKey(record.uri)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="hidden sm:inline">
                    {getRecordType(record.value)}
                  </span>
                  <span className="hidden sm:inline">
                    {formatBytes(JSON.stringify(record.value).length)}
                  </span>
                  <span className="hidden md:inline">
                    {formatDate(record.value.createdAt)}
                  </span>
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
              </div>
            </Link>
          ))}
        </div>
      </div>

      {data.cursor && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setCursor(data.cursor)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}

function formatCollectionName(collection: string): string {
  const collectionMap: Record<string, string> = {
    'app.bsky.feed.post': 'Posts',
    'app.bsky.feed.like': 'Likes',
    'app.bsky.feed.repost': 'Reposts',
    'app.bsky.graph.follow': 'Follows',
    'app.bsky.graph.block': 'Blocks',
    'app.bsky.graph.list': 'Lists',
    'app.bsky.actor.profile': 'Profile',
    'app.bsky.feed.generator': 'Feed Generators',
    'app.bsky.labeler.service': 'Labeler Service',
  }

  return collectionMap[collection] || collection.split('.').pop() || collection
}

function getRecordKey(uri: string): string {
  const parts = uri.split('/')
  return parts[parts.length - 1] || uri
}

function getRecordPreview(value: any): string {
  if (!value) return 'Empty record'

  if (value.text && typeof value.text === 'string') {
    return value.text.length > 100
      ? value.text.substring(0, 100) + '...'
      : value.text
  }

  if (value.name && typeof value.name === 'string') {
    return value.name
  }

  if (value.displayName && typeof value.displayName === 'string') {
    return value.displayName
  }

  if (value.description && typeof value.description === 'string') {
    return value.description.length > 100
      ? value.description.substring(0, 100) + '...'
      : value.description
  }

  if (value.subject) {
    return `Subject: ${JSON.stringify(value.subject).substring(0, 50)}...`
  }

  const keys = Object.keys(value).slice(0, 3).join(', ')
  return keys ? `{${keys}...}` : 'Record'
}

function getRecordType(value: any): string {
  if (!value) return 'empty'

  if (value.$type) {
    const type = value.$type.split('.').pop()
    return type || 'record'
  }

  if (value.text) return 'text'
  if (value.subject) return 'reference'
  if (value.name || value.displayName) return 'profile'

  return 'record'
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes === 0 ? 'Just now' : `${minutes}m ago`
      }
      return `${hours}h ago`
    } else if (days < 7) {
      return `${days}d ago`
    } else if (days < 30) {
      return `${Math.floor(days / 7)}w ago`
    } else if (days < 365) {
      return `${Math.floor(days / 30)}mo ago`
    }
    return `${Math.floor(days / 365)}y ago`
  } catch {
    return '-'
  }
}
