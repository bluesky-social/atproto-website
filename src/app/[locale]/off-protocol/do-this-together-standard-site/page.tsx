import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'Why Don\'t We Just Do This Together?',
  description: 'Jim sits down with members of the core team building and governing Standard.site, the shared Lexicon for publishing longform writing on atproto. Brooke from pckt.blog, Jared from Leaflet, and Miguel from Offprint cover the design tradeoffs in creating a new shared format, tales of data migrations, strategies for shared governance, and why you shouldn\'t buy a premium domain name.',
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
