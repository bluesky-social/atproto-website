import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'Protocolly Atmoseed',
  description: 'News from around the Atmosphere, including a proposal to fix localhost, more webdevs getting into atproto, Mu Social’s opinionated news feed, and more.',
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
