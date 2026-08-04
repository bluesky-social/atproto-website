import Link from 'next/link'
import { episodes, formatDurationForDisplay, SHOW } from '@/lib/episodes'
import {
  FORMAT_LABELS,
  FILTER_ORDER,
  FILTER_LABELS,
  toFormatFilter,
} from '@/lib/episodeFormat.mjs'
import { SubscribeLinks } from '@/components/SubscribeLinks'
import { OffProtocolNext } from '@/components/OffProtocolNext'

/**
 * Off Protocol Episode Listing
 *
 * HOW TO ADD A NEW EPISODE:
 *   npm run podcast create
 *
 * That command scaffolds:
 *   - src/app/[locale]/off-protocol/<slug>/page.tsx
 *   - src/app/[locale]/off-protocol/<slug>/en.mdx        (show notes)
 *   - src/app/[locale]/off-protocol/<slug>/transcript.mdx (optional)
 *   - prepends a new entry in src/lib/episodes.ts
 */

export const metadata = {
  title: 'Off Protocol',
  description: 'A podcast about the AT Protocol and the open social web.',
}

/**
 * The format filter is plain links carrying `?show=`, not a client component:
 * it works with JavaScript disabled, each view is a shareable URL, and the page
 * ships no extra JS for it. An unrecognized value falls back to the whole
 * catalogue rather than an empty list.
 */
export default async function OffProtocolIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>
}) {
  const show = toFormatFilter((await searchParams).show)
  const shown = show === 'all' ? episodes : episodes.filter((e) => e.format === show)

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-12 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
          <h1 className="font-mono text-4xl font-bold uppercase tracking-tight md:text-5xl">
            {SHOW.title}
          </h1>
          <SubscribeLinks className="shrink-0" />
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {SHOW.description}
        </p>
      </header>

      <div className="mb-12">
        <OffProtocolNext />
      </div>

      {/* Absolute paths without the locale prefix, matching the episode links
          below — the i18n proxy adds the prefix. Avoids relying on relative-URL
          resolution, which the client router handles inconsistently. */}
      <nav
        aria-label="Filter episodes by format"
        className="mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-sm"
      >
        <span className="text-zinc-500 dark:text-zinc-500">Show:</span>
        {FILTER_ORDER.map((key) => {
          const active = key === show
          return (
            <Link
              key={key}
              href={key === 'all' ? '/off-protocol' : `/off-protocol?show=${key}`}
              aria-current={active ? 'true' : undefined}
              className={
                active
                  ? 'font-medium text-zinc-900 underline decoration-2 underline-offset-4 dark:text-white'
                  : 'text-zinc-500 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:text-white'
              }
            >
              {FILTER_LABELS[key]}
            </Link>
          )
        })}
      </nav>

      {episodes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No episodes yet. Run <code className="font-mono">npm run podcast create</code> to add one.
        </p>
      ) : shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {/* Not lowercased: "AMAs" must not become "amas". */}
          No {FILTER_LABELS[show]} yet.{' '}
          <Link href="/off-protocol" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-white">
            Show all episodes
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-8">
          {shown.map((episode) => (
            <article
              key={episode.slug}
              className="group rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <Link href={`/off-protocol/${episode.slug}`} className="block">
                {/* Separators match EpisodeHeader on the individual page:
                    &bull;, and aria-hidden so they aren't read aloud. */}
                <div className="flex items-baseline gap-2 text-sm text-zinc-500 dark:text-zinc-500">
                  <span className="font-mono">Episode {episode.episodeNumber}</span>
                  <span aria-hidden="true">&bull;</span>
                  <time dateTime={episode.pubDate}>{episode.date}</time>
                  <span aria-hidden="true">&bull;</span>
                  <span>{formatDurationForDisplay(episode.durationSeconds)}</span>
                  {/* Same neutral pill for every format — the word does the
                      differentiating, which suits the restraint of this page.
                      leading-[1.125rem] + the 1px border adds up to 20px, the
                      line-height of the text-sm row, so the pill doesn't make
                      this line taller than the others. */}
                  <span className="ml-1 rounded-full border border-zinc-300 px-2 text-[0.7rem] leading-[1.125rem] dark:border-zinc-700">
                    {FORMAT_LABELS[episode.format]}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {episode.title}
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {episode.description}
                </p>
                {episode.guests && episode.guests.length > 0 && (
                  <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
                    With {episode.guests.join(', ')}
                  </p>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
