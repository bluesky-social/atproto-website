import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'The Puppy Problem',
  description:
    'Jim and Alex are live with the first live episode under the new Off Protocol name. Protocol meetups are happening everywhere, Alex and Jim were both in Portland, the Ozone moderation tool has some new features, and Bluesky is considering an edit button. Plus a few of your questions.',
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
