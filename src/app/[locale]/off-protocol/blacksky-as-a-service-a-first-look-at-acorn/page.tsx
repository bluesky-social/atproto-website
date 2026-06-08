import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'Blacksky As a Service: a First Look at Acorn',
  description:
    "Rishi Balakrishnan joins to talk about the work that went into building Acorn, Blacksky's new platform for creating moderated communities on atproto — and why the landing page never mentions a PDS.",
}

export default async function EpisodeRoute({ params }: any) {
  const Notes = await import(`./${params.locale}.mdx`).catch(
    () => import(`./en.mdx`),
  )
  let Transcript = null
  try {
    Transcript = await import(`./transcript.mdx`)
  } catch {
    // optional
  }

  return (
    <EpisodePage
      default={Notes.default}
      header={Notes.header}
      Transcript={Transcript?.default}
    />
  )
}
