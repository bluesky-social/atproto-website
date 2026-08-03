import { EpisodePage } from '@/components/EpisodePage'
import { mdxRouteMetadata } from '@/lib/localizedMdx'
import * as notes from './en.mdx'
import * as transcript from './transcript.mdx'

// Metadata comes from the MDX header (see mdx.d.ts). Episodes aren't
// translated, so en.mdx and transcript.mdx are static imports — which is also
// what makes show-notes edits hot-reload.

export function generateMetadata() {
  return mdxRouteMetadata(notes)
}

export default function EpisodeRoute() {
  return (
    <EpisodePage
      default={notes.default}
      header={notes.header}
      Transcript={transcript.default}
    />
  )
}
