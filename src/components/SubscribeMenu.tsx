'use client'

import { useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import clsx from 'clsx'
import type { SubscribeUrls } from '@/lib/episodes'

interface Props {
  /** Canonical feed URL — used to build app deep links and as the copyable RSS value. */
  feedUrl: string
  /** Directory URLs (Apple, Spotify) populated post-launch. */
  directory: SubscribeUrls
  className?: string
}

/**
 * Build a deep link that opens a specific podcast app to the "add this feed"
 * flow. Each app exposes its own URL scheme; on devices without the app
 * installed, the link is a no-op (browser silently ignores the unknown
 * scheme). That's the standard pattern other podcast sites use.
 */
function appLinks(feedUrl: string) {
  const noScheme = feedUrl.replace(/^https?:\/\//, '')
  return {
    overcast: `overcast://x-callback-url/add?url=${encodeURIComponent(feedUrl)}`,
    pocketcasts: `pktc://subscribe/${noScheme}`,
    castro: `castro://subscribe/${encodeURIComponent(feedUrl)}`,
  }
}

export function SubscribeMenu({ feedUrl, directory, className }: Props) {
  const [copied, setCopied] = useState(false)
  const apps = appLinks(feedUrl)

  async function copyFeed() {
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Permissions blocked or older browser — fall through silently.
    }
  }

  return (
    <Menu as="div" className={clsx('relative inline-block', className)}>
      <MenuButton className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white">
        Subscribe
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="h-3 w-3"
          fill="currentColor"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        className="z-10 mt-1 w-72 origin-top-left rounded-md border border-zinc-200 bg-white p-1 shadow-lg outline-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        {directory.apple && (
          <SubscribeMenuLink href={directory.apple} label="Apple Podcasts" />
        )}
        {directory.spotify && (
          <SubscribeMenuLink href={directory.spotify} label="Spotify" />
        )}
        <SubscribeMenuLink href={apps.overcast} label="Overcast" />
        <SubscribeMenuLink href={apps.pocketcasts} label="Pocket Casts" />
        <SubscribeMenuLink href={apps.castro} label="Castro" />

        <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />

        <MenuItem>
          {() => (
            <div className="flex flex-col gap-1.5 rounded px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                RSS feed
              </span>
              <div className="flex items-center gap-2">
                <code
                  className="flex-1 truncate font-mono text-xs text-zinc-700 dark:text-zinc-300"
                  title={feedUrl}
                >
                  {feedUrl}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    copyFeed()
                  }}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-white"
                  aria-live="polite"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}

function SubscribeMenuLink({ href, label }: { href: string; label: string }) {
  return (
    <MenuItem>
      {({ focus }) => (
        <a
          href={href}
          className={clsx(
            'block rounded px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300',
            focus && 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white',
          )}
        >
          {label}
        </a>
      )}
    </MenuItem>
  )
}
