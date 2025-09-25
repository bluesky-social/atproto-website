'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useIsPresent } from 'framer-motion'
import { IconContainer } from './IconContainer'
import { SignalIcon } from './icons/SignalIcon'
import { ArrowIcon } from './icons/ArrowIcon'

const INIT_ACTIVITY = [
  {
    id: 6,
    type: 'app.bsky.feed.like',
    handle: 'alice.com',
    date: '3s ago',
  },
  {
    id: 5,
    type: 'app.bsky.feed.like',
    handle: 'carla.com',
    date: '4s ago',
  },
  {
    id: 4,
    type: 'app.bsky.feed.post',
    handle: 'alice.com',
    date: '10s ago',
  },
  {
    id: 3,
    type: 'app.bsky.feed.like',
    handle: 'bob.com',
    date: '11s ago',
  },
  {
    id: 2,
    type: 'app.bsky.feed.repost',
    handle: 'bob.com',
    date: '11s ago',
  },
  {
    id: 1,
    type: 'app.bsky.feed.repost',
    handle: 'bob.com',
    date: '11s ago',
  },
]

let _id = INIT_ACTIVITY[0].id
function genId() {
  return ++_id
}

function genType() {
  const rand = Math.random()
  if (rand < 0.5) {
    return 'app.bsky.feed.like'
  }
  if (rand < 0.8) {
    return 'app.bsky.feed.repost'
  }
  return 'app.bsky.feed.post'
}

function genHandle() {
  return ['alice.com', 'bob.com', 'carla.com', 'dan.com', 'erica.com'][
    Math.floor(Math.random() * 5)
  ]
}

function genActivity() {
  return {
    id: genId(),
    type: genType(),
    handle: genHandle(),
    date: `${(Math.random() * 30) | 0}ms ago`,
  }
}

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function Firehose() {
  const [activity, setActivity] = useState(() => INIT_ACTIVITY)

  useEffect(() => {
    const i = setInterval(() => {
      // if (Math.random() < 0.1) {
      setActivity((activity) => {
        return [genActivity(), ...activity.slice(0, -1)]
      })
      // }
    }, 3e3)
    return () => clearInterval(i)
  })

  return (
    <div className="not-prose relative rounded-2xl bg-white ring-1 ring-zinc-900/7.5 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 hover:ring-zinc-900/10 dark:bg-zinc-800 dark:ring-zinc-100/7.5 dark:hover:shadow-black/5 dark:hover:ring-zinc-100/10">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative">
          <IconContainer icon={SignalIcon} />
          {/* <span className="absolute -top-[1px] right-0 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
          </span> */}
        </div>
        <div className="flex-auto">
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-200">
            Stream from the firehose
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-500">Learn more</span>
          <ArrowIcon className="mr-1 h-7 w-7 text-blue-500" />
        </div>
      </div>
      <div className="h-[225px] overflow-hidden rounded-b-2xl border-t border-zinc-900/7.5 bg-zinc-50 px-4 py-4 dark:border-white/10 dark:bg-zinc-900">
        <motion.ul layout role="list" className="space-y-6">
          {activity.map((activityItem, activityItemIdx) => (
            <motion.li
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                opacity: { ease: 'linear' },
                layout: { duration: 0.1 },
              }}
              key={activityItem.id}
              className="relative flex gap-x-4"
            >
              <div
                className={classNames(
                  activityItemIdx === activity.length - 1 ? 'h-6' : '-bottom-6',
                  'absolute left-0 top-0 flex w-6 justify-center',
                )}
              >
                <div className="w-px bg-zinc-500" />
              </div>
              <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-zinc-50 dark:bg-zinc-900">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 ring-1 ring-zinc-500 dark:bg-zinc-700" />
              </div>
              <p className="bg:text-zinc-400 py-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-300">
                <span className="font-medium text-zinc-800 dark:text-zinc-100">
                  @{activityItem.handle}
                </span>{' '}
                put{' '}
                <span className="text-blue-500 dark:text-blue-400">
                  {activityItem.type}
                </span>
              </p>
              <span className="flex-none py-0.5 text-xs leading-5 text-zinc-400">
                {activityItem.date}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
      <Link href="/sdks">
        <span className="absolute inset-0 rounded-2xl" />
      </Link>
    </div>
  )
}
