import type { MDXContent } from 'mdx/types'
import { MdxPassthrough } from './MdxPassthrough'

interface EpisodeTranscriptProps {
  /** The default export of the transcript MDX module. */
  Transcript: MDXContent
}

export function EpisodeTranscript({ Transcript }: EpisodeTranscriptProps) {
  return (
    <details className="group mt-12 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <summary className="cursor-pointer list-none p-4 font-mono text-sm font-medium uppercase tracking-wide text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
        <span className="mr-2 inline-block transition group-open:rotate-90">▸</span>
        Transcript
      </summary>
      <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
        {/*
          Plain `prose prose-sm` + max-w-none mirrors the show-notes layout
          (see EpisodePage). The MdxPassthrough wrapper suppresses the
          global MDX wrapper that would otherwise add an outer <article>
          plus a nested <Prose> with its own padding and max-width.
        */}
        <div className="prose prose-sm max-w-none [&>:first-child]:!mt-0 dark:prose-invert">
          <Transcript components={{ wrapper: MdxPassthrough }} />
        </div>
      </div>
    </details>
  )
}
