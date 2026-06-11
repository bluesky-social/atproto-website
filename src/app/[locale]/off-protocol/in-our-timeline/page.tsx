import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'In Our Timeline',
  description: 'Paul and Daniel are on the livestream this week with a look at the new Standard.site integration, updates from permissioned data, and news from around the Atmosphere',
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
