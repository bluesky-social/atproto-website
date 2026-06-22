import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'The Cobbler\'s Kids',
  description: 'Jim and Alex are back on the livestream at a new time to discuss personal websites, Coop 1.0, exciting announcements from Eurosky, a new OAuth scope builder—plus news from around the Atmosphere.',
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
