import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'Why a New Protocol? The History and Future of AT Protocol',
  description:
    "Bluesky CTO Paul Frazee and Head of Protocol Daniel Holmgren join for a wide-ranging conversation about what atproto is, why it exists, how it got built, and where it's going next. From a Twitter consultancy to an IETF working group, this is where to get started.",
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
