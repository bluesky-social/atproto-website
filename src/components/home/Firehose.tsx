'use client'

import clsx from 'clsx'
import { useEffect, useState, useCallback } from 'react'
import {
  Jetstream,
  CommitType,
  CommitEvent,
  Collection,
} from '@skyware/jetstream'
import { DotPatternBackground } from '../DotPattern'
import { ButtonArrowIcon } from '../Button'
import Link from 'next/link'

export function Firehose() {
  const [jetstream] = useState(() => new Jetstream())
  const [active, setActive] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [records, setRecords] = useState<string[]>([])

  useEffect(() => {
    const onCommit = (event: CommitEvent<Collection>) => {
      if (event.commit.operation === CommitType.Create) {
        const record = JSON.stringify(event.commit.record)
        setRecords((r) => {
          r = r.concat([record])
          if (r.length > 100) {
            r = r.slice(50)
          }
          return r
        })
      }
    }
    jetstream.on('commit', onCommit)
    return () => {
      jetstream.off('commit', onCommit)
    }
  }, [jetstream])

  const toggle = useCallback(() => {
    if (active) {
      setActive(false)
      jetstream.close()
    } else {
      setActive(true)
      setHasRun(true)
      jetstream.start()
    }
  }, [active, setActive, setHasRun, jetstream])

  return (
    <div className="relative py-12">
      <DotPatternBackground />
      <div className="relative z-10 mx-auto rounded-sm bg-zinc-900 ring-1 ring-zinc-900/20 md:w-full lg:w-[800px] dark:ring-zinc-100/15">
        <div className="flex justify-center py-8">
          <div className="max-md:px-6 md:w-[420px]">
            <h3 className="pb-1 text-center text-2xl font-medium md:text-4xl">
              Public Firehose
            </h3>
            <p className="text-center text-lg text-zinc-400">
              Tap into the event stream for all public activity. Build feeds,
              bots, search engines, and applications using live activity. No API
              key required.
            </p>
          </div>
        </div>
        <div
          className={clsx(
            'transition-height overflow-hidden border-t border-zinc-900/20 duration-700 dark:border-zinc-100/15',
            hasRun ? 'h-[400px]' : 'h-[140px] md:h-[56px]',
          )}
        >
          <div className="flex flex-col md:flex-row justify-between gap-4 px-4 py-4 font-mono">
            <div
              className={clsx(
                // 'hidden md:block',
                active
                  ? 'animate-text bg-gradient-to-r from-yellow-800 to-yellow-400 bg-clip-text text-transparent'
                  : '',
              )}
            >
              $ websocat wss://jetstream1.us-east.bsky.network/subscribe
            </div>
            <div
              onClick={toggle}
              className={clsx(
                'flex cursor-pointer items-center gap-1 rounded-sm border px-2',
                'max-md:flex-1 max-md:px-4 max-md:py-2',
                active
                  ? 'border-yellow-600 bg-yellow-950 text-yellow-400'
                  : 'border-green-600 bg-green-950 text-green-400',
              )}
            >
              {active ? <StopIcon /> : <PlayIcon />}
              <span>{active ? 'Stop stream' : 'Start stream'}</span>
            </div>
          </div>
          <div className="overflow-x-scroll">
            {records.reverse().map((r) => (
              <FirehoseEvent key={r} record={r} />
            ))}
          </div>
        </div>
        <Link className="border-t border-zinc-900/20 dark:border-zinc-100/15 flex flex-row items-center justify-center font-medium py-4" href="/guides/sync">
          <div>LEARN MORE</div>
          <ButtonArrowIcon className="relative -mr-1 h-6 w-6" />
        </Link>
      </div>
    </div>
  )
}

export function FirehoseEvent({ record }: { record: string }) {
  return (
    <div className="flex items-center font-mono text-xs">
      <div className="text-nowrap px-4 text-zinc-200">{record}</div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
        clipRule="evenodd"
      />
    </svg>
  )
}
