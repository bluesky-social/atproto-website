import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: 'A Thousand PRs in Two Weeks: Building NPMX',
  description:
    'Daniel Roe, Matias Capeletto, and Zeu join to discuss how their frustration with JavaScript packaging went from a Bluesky post to one of the most successful new community-led projects on the protocol.',
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
