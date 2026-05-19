import { formatDurationForDisplay, SHOW, type Episode } from '@/lib/episodes'
import { SubscribeLinks } from './SubscribeLinks'

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
    | 'durationSeconds'
    | 'guests'
    | 'host'
    | 'audioUrl'
    | 'audioMimeType'
  > {}

export function EpisodeHeader(props: EpisodeHeaderProps) {
  const host = props.host ?? SHOW.defaultHost
  const mimeType = props.audioMimeType ?? 'audio/mpeg'

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3 text-sm text-zinc-500 dark:text-zinc-500">
          <span className="font-mono">Episode {props.episodeNumber}</span>
          <time dateTime={props.pubDate}>{props.date}</time>
          <span aria-hidden="true">·</span>
          <span>{formatDurationForDisplay(props.durationSeconds)}</span>
        </div>
        <h1 className="font-mono text-3xl font-medium md:text-4xl">
          {props.title}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {props.description}
        </p>
        {props.guests && props.guests.length > 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            With {props.guests.join(', ')}
          </p>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Hosted by {host}
        </p>
      </div>

      {/*
        preload="metadata" gets us the duration and seek bar without
        downloading the full episode on every page load.
      */}
      <audio
        controls
        preload="metadata"
        className="w-full"
        aria-label={`Audio player for ${props.title}`}
      >
        <source src={props.audioUrl} type={mimeType} />
        Your browser does not support the audio element.{' '}
        <a href={props.audioUrl} className="underline">
          Download the MP3
        </a>{' '}
        instead.
      </audio>

      <SubscribeLinks />
    </header>
  )
}
