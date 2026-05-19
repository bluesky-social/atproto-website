// src/components/EpisodePage.tsx
import { type Episode } from '@/lib/episodes'
import { EpisodeHeader, type EpisodeHeaderProps } from './EpisodeHeader'
import { EpisodeTranscript } from './EpisodeTranscript'
import { BlueskyConversation } from './BlueskyConversation'

const BSKY_CONVERSATION_HEADER =
  "This episode has {replies?{replies|reply|replies}}{quotes?, {quotes|quote|quotes}}{repostedBy?, and has been reposted by {repostedBy}}."

interface EpisodePageProps {
  /** Default export of the show-notes MDX module. */
  default: React.ComponentType
  /**
   * Header data — same fields as Episode, minus the slug-level concerns.
   * Comes from the MDX module's `header` export.
   */
  header: EpisodeHeaderProps &
    Pick<Episode, 'blueskyPostUrl' | 'hasShowNotes' | 'hasTranscript'>
  /** Optional default export of a transcript MDX module. */
  Transcript?: React.ComponentType
}

export function EpisodePage({ default: Notes, header, Transcript }: EpisodePageProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <EpisodeHeader {...header} />

      {header.hasShowNotes && (
        <section className="mt-12">
          <h2 className="font-mono text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
            Show notes
          </h2>
          {/*
            Use the typography classes directly rather than the <Prose>
            wrapper. <Prose> adds its own px-4 md:px-16 padding and
            constrains children to max-w-2xl, which inside our already-
            padded article wrapper visually centers the content and indents
            it away from the "Show notes" eyebrow above. Plain prose +
            max-w-none keeps the body left-aligned with the eyebrow.
          */}
          <div className="prose mt-4 max-w-none [&>:first-child]:!mt-0 dark:prose-invert">
            <Notes />
          </div>
        </section>
      )}

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
