import { EpisodePage } from '@/components/EpisodePage'
import * as notes from './en.mdx'
import * as transcript from './transcript.mdx'

// Episodes aren't translated, so en.mdx is imported statically: it gives the
// route a real module-graph edge (content edits hot-reload) and its header
// supplies the metadata rather than a duplicate copy that can drift from it.
// transcript.mdx is always scaffolded alongside en.mdx, so it's a static import
// too — a stub with no real transcript renders nothing, and EpisodePage only
// shows the section when the header sets hasTranscript.

export function generateMetadata() {
  return {
    title: notes.header.title,
    description: notes.header.description,
  }
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
