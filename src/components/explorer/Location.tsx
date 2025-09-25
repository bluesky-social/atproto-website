'use client'

import Link from 'next/link'
import { useState } from 'react'

interface LocationProps {
  repo: string
  collection?: string
  rkey?: string
}

export default function Location({ repo, collection, rkey }: LocationProps) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(
    `at://${repo}/${collection || ''}${rkey ? `/${rkey}` : ''}`,
  )
  return (
    <div className="mb-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      {editing ? (
        <>
          <div className="flex flex-1 items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600 dark:bg-white/5 dark:outline-white/10 dark:focus-within:outline-indigo-500">
            <input
              id="company-website"
              name="company-website"
              type="text"
              placeholder="atproto.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6 dark:text-white dark:placeholder:text-gray-500"
              autoFocus
            />
          </div>
          <button
            type="button"
            className="shadow-xs rounded-sm bg-red-50 px-2 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:shadow-none dark:hover:bg-red-500/30"
            onClick={() => setEditing(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-4"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </>
      ) : (
        <>
          <span>at://</span>
          <Link
            href={`/explorer?repo=${repo}`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {repo}
          </Link>
          {collection ? (
            <>
              <span>/</span>
              <Link
                href={`/explorer?repo=${repo}&collection=${collection}`}
                className="hover:text-blue-600 dark:hover:text-blue-400"
              >
                {collection}
              </Link>
            </>
          ) : (
            <></>
          )}
          {rkey ? (
            <>
              <span>/</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {rkey}
              </span>
            </>
          ) : (
            <></>
          )}
          <button
            type="button"
            className="shadow-xs rounded-sm bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400 dark:shadow-none dark:hover:bg-indigo-500/30"
            onClick={() => setEditing(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-3"
            >
              <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
