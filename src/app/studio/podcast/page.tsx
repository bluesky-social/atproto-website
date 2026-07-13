import { notFound } from 'next/navigation'
import { EpisodeEditor } from './EpisodeEditor'

export const metadata = { title: 'Studio — Podcast' }

export default function StudioPodcastPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <EpisodeEditor />
}
