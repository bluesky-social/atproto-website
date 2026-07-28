import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'The Iron’s Still Hot',
  description: 'Daniel Holmgren joins the livestream for an AMA on permissioned data — why it',
}

export default async function EpisodeRoute({ params }: any) {
  const Notes = await import(`./${(await params).locale}.mdx`).catch(
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
