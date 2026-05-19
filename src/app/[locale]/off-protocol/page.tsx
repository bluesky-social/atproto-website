import Link from 'next/link'
import { episodes, formatDurationForDisplay, SHOW } from '@/lib/episodes'
import { SubscribeLinks } from '@/components/SubscribeLinks'

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

export default async function OffProtocolIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-12 flex flex-col gap-4">
        <h1 className="font-mono text-4xl font-bold uppercase tracking-tight md:text-5xl">
          {SHOW.title}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {SHOW.description}
        </p>
        <SubscribeLinks />
      </header>

      {episodes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No episodes yet. Run <code className="font-mono">npm run podcast create</code> to add one.
        </p>
      ) : (
        <div className="space-y-8">
          {episodes.map((episode) => (
            <article
              key={episode.slug}
              className="group rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
            >
              <Link href={`/off-protocol/${episode.slug}`} className="block">
                <div className="flex items-baseline gap-3 text-sm text-zinc-500 dark:text-zinc-500">
                  <span className="font-mono">Episode {episode.episodeNumber}</span>
                  <time dateTime={episode.pubDate}>{episode.date}</time>
                  <span aria-hidden="true">·</span>
                  <span>{formatDurationForDisplay(episode.durationSeconds)}</span>
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
