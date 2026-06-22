// src/components/EpisodePage.tsx
import type { MDXContent } from 'mdx/types'
import { type Episode } from '@/lib/episodes'
import { EpisodeHeader, type EpisodeHeaderProps } from './EpisodeHeader'
import { EpisodeTranscript } from './EpisodeTranscript'
import { BlueskyConversation } from './BlueskyConversation'
import { MdxPassthrough } from './MdxPassthrough'

const BSKY_CONVERSATION_HEADER =
  "This episode has {replies?{replies|reply|replies}}{quotes?, {quotes|quote|quotes}}{repostedBy?, and has been reposted by {repostedBy}}."

interface EpisodePageProps {
  /** Default export of the show-notes MDX module. */
  default: MDXContent
  /**
   * Header data — same fields as Episode, minus the slug-level concerns.
   * Comes from the MDX module's `header` export. `hasShowNotes` /
   * `hasTranscript` live only in the MDX header (the single source of truth
   * for whether real notes/transcript content exists), not in the Episode
   * catalog, so they're declared here directly.
   */
  header: EpisodeHeaderProps &
    Pick<Episode, 'description' | 'blueskyPostUrl'> & {
      hasShowNotes?: boolean
      hasTranscript?: boolean
    }
  /** Optional default export of a transcript MDX module. */
  Transcript?: MDXContent
}

export function EpisodePage({ default: Notes, header, Transcript }: EpisodePageProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <EpisodeHeader {...header} />

      {/*
        Show notes section is always present. When the author has written
        real notes we render the MDX body; otherwise the episode description
        stands in for them (the description no longer appears as a subhead in
        the header, and it still shows in the episode listing).
      */}
      <section className="mt-12">
        <h2 className="font-mono text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
          Show notes
        </h2>
        <div className="prose mt-4 max-w-none [&>:first-child]:!mt-0 dark:prose-invert">
          {header.hasShowNotes ? (
            <Notes components={{ wrapper: MdxPassthrough }} />
          ) : (
            <p>{header.description}</p>
          )}
        </div>
      </section>

      {Transcript && header.hasTranscript && (
        <EpisodeTranscript Transcript={Transcript} />
      )}

      {header.blueskyPostUrl && (
        <div className="mt-12">
          <BlueskyConversation
            uri={header.blueskyPostUrl}
            headerTemplate={BSKY_CONVERSATION_HEADER}
          />
        </div>
      )}
    </article>
  )
}
