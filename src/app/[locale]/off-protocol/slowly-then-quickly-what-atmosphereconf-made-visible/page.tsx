import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'Slowly, Then Quickly: What AtmosphereConf Made Visible',
  description:
    'With AtmosphereConf 2026 wrapped, Boris Mann and Ted Han join to talk about what the gathering surfaced in the ecosystem. From the IETF working group, the move beyond a single foundation, to a growing layer of co-ops, regional meetups, and independent stewards.',
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
