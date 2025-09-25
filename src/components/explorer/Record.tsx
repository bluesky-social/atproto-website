'use client'

import { useState } from 'react'
import { useGetRecord } from '@/hooks/useRepo'
import Location from './Location'

interface RecordProps {
  repo: string
  collection: string
  rkey: string
}

export default function Record({ repo, collection, rkey }: RecordProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  const { data, isLoading, error } = useGetRecord({
    repo,
    collection,
    rkey,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="mb-4 h-4 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-96 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load record
        </p>
      </div>
    )
  }

  if (!data) {
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
        <p className="text-gray-600 dark:text-gray-400">Record not found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <Location repo={repo} collection={collection} rkey={rkey} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Record: {rkey}
        </h3>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">URI:</span>
              <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                {data.uri}
              </code>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('formatted')}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  viewMode === 'formatted'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Formatted
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Raw JSON
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {viewMode === 'formatted' ? (
            <FormattedView value={data.value} />
          ) : (
            <RawView value={data.value} />
          )}
        </div>

        {data.cid && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">CID:</span>
              <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                {data.cid}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FormattedView({ value }: { value: any }) {
  if (!value || typeof value !== 'object') {
    return (
      <div className="text-gray-700 dark:text-gray-300">
        {JSON.stringify(value)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {value.$type && (
        <div className="border-b border-gray-200 pb-3 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Type:{' '}
          </span>
          <span className="text-sm text-blue-600 dark:text-blue-400">
            {value.$type}
          </span>
        </div>
      )}

      {value.text && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            Text
          </h4>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
              {value.text}
            </p>
          </div>
        </div>
      )}

      {value.displayName && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            Display Name
          </h4>
          <p className="text-gray-900 dark:text-white">{value.displayName}</p>
        </div>
      )}

      {value.description && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            Description
          </h4>
          <p className="text-gray-900 dark:text-white">{value.description}</p>
        </div>
      )}

      {value.createdAt && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
            Created At
          </h4>
          <p className="text-gray-900 dark:text-white">
            {new Date(value.createdAt).toLocaleString()}
          </p>
        </div>
      )}

      {value.subject && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            Subject
          </h4>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <pre className="overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300">
              {JSON.stringify(value.subject, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {value.embed && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            Embed
          </h4>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <pre className="overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300">
              {JSON.stringify(value.embed, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {value.facets && value.facets.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            Facets
          </h4>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <pre className="overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300">
              {JSON.stringify(value.facets, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {Object.entries(value)
        .filter(
          ([key]) =>
            ![
              '$type',
              'text',
              'displayName',
              'description',
              'createdAt',
              'subject',
              'embed',
              'facets',
            ].includes(key),
        )
        .map(([key, val]) => (
          <div key={key}>
            <h4 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h4>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
              {typeof val === 'object' ? (
                <pre className="overflow-x-auto font-mono text-xs text-gray-700 dark:text-gray-300">
                  {JSON.stringify(val, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-900 dark:text-white">{String(val)}</p>
              )}
            </div>
          </div>
        ))}
    </div>
  )
}

function RawView({ value }: { value: any }) {
  const jsonString = JSON.stringify(value, null, 2)

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-900/50">
        <code className="font-mono text-xs text-gray-700 dark:text-gray-300">
          {jsonString}
        </code>
      </pre>
      <button
        onClick={() => navigator.clipboard.writeText(jsonString)}
        className="absolute right-2 top-2 rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
      >
        Copy
      </button>
    </div>
  )
}
