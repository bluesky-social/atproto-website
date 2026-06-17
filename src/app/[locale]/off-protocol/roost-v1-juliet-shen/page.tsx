import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: '“Policy Without Tools Is Just Poetry”',
  description: 'Juliet Shen from ROOST joins the show to talk through the Coop 1.0 release, what open-source trust and safety unlocks for new builders, and where AI actually belongs in moderation',
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
