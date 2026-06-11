import { Fragment } from 'react'
import Link from 'next/link'
import knownAuthors from '@/lib/authors.json'
import { SHOW, type Episode } from '@/lib/episodes'
import { SubscribeLinks } from './SubscribeLinks'

// Renders a name as a link to bsky.app when authors.json knows its DID,
// otherwise as plain text. Mirrors PageHeader's blog-byline pattern.
function AuthorName({ name }: { name: string }) {
  const did = (knownAuthors as Record<string, string>)[name]
  if (!did) return <>{name}</>
  return (
    <a
      href={`https://bsky.app/profile/${did}`}
      className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  )
}

// Render a name list with natural English joiners:
//   1 → "A"
//   2 → "A and B"
//   3+ → "A, B, and C"   (Oxford comma)
function NameList({ names }: { names: string[] }) {
  if (names.length === 0) return null
  if (names.length === 1) return <AuthorName name={names[0]} />
  if (names.length === 2) {
    return (
      <>
        <AuthorName name={names[0]} /> and <AuthorName name={names[1]} />
      </>
    )
  }
  const last = names[names.length - 1]
  return (
    <>
      {names.slice(0, -1).map((name, i) => (
        <Fragment key={i}>
          <AuthorName name={name} />,{' '}
        </Fragment>
      ))}
      and <AuthorName name={last} />
    </>
  )
}

// Picks the exact subset of Episode this header actually reads. Stating
// what's used (rather than Omit<>ing what isn't) keeps RSS-only fields
// like audioSizeBytes and explicit out of the visual surface.
export interface EpisodeHeaderProps
  extends Pick<
    Episode,
    | 'episodeNumber'
    | 'title'
    | 'description'
    | 'date'
    | 'pubDate'
    | 'guests'
    | 'host'
    | 'audioUrl'
    | 'audioMimeType'
  > {}

export function EpisodeHeader(props: EpisodeHeaderProps) {
  const hosts = props.host ?? [SHOW.defaultHost]
  const mimeType = props.audioMimeType ?? 'audio/mpeg'

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3 text-sm text-zinc-500 dark:text-zinc-500">
          <span className="font-mono">
            <Link
              href="/off-protocol"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Off Protocol
            </Link>{' '}
            &gt; Episode {props.episodeNumber}
          </span>
          <time dateTime={props.pubDate}>{props.date}</time>
        </div>
        <h1 className="font-mono text-3xl font-medium md:text-4xl">
          {props.title}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {props.description}
        </p>
        {props.guests && props.guests.length > 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            With <NameList names={props.guests} />
          </p>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Hosted by <NameList names={hosts} />
        </p>
      </div>

      {/*
        Wrapping <audio> in a labeled <section> creates a "region" landmark
        screen readers can jump to (NVDA/JAWS announce the surrounding
        section rather than the audio element's own aria-label).

        preload="metadata" gets us the duration and seek bar without
        downloading the full episode on every page load.

        Layout: stack below sm so the audio player keeps its full width on
        small phones (Safari's audio controls don't compress comfortably
        below ~250px); side-by-side at sm+ where there's room for both.
      */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <section
          className="flex-1"
          aria-label={`Audio player for ${props.title}`}
        >
          <audio controls preload="metadata" className="w-full">
            <source src={props.audioUrl} type={mimeType} />
            Your browser does not support the audio element.{' '}
            <a href={props.audioUrl} className="underline">
              Download the MP3
            </a>{' '}
            instead.
          </audio>
        </section>
        <SubscribeLinks className="sm:flex-shrink-0" />
      </div>
    </header>
  )
}
