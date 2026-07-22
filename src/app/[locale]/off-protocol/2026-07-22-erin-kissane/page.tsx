import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: '“Nothing Is Ever Over”',
  description: 'Writer, speaker, and researcher Erin Kissane joins Jim to trace how the social internet got here, what’s worth salvaging, and how we can do better by listening to people.',
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
