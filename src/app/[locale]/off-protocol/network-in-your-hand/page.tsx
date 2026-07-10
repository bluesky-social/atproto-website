import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'Sometimes you just want to hold the entire network in your hand',
  description: 'Jim and Alex are back on the livestream. The permissioned data proposal has shipped, updates from Tangled, Roomy, and Anisota, and a look ahead at Jetstream v2.',
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
