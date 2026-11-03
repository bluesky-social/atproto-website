import { notFound } from 'next/navigation'
import { BlogIndex } from '@/components/BlogListing'
import { findBlogTopic } from '@/lib/blogTags.mjs'

type Props = { params: Promise<{ topic: string }> }

// No generateStaticParams: the parent [locale] segment does not generate its
// params either, so topic pages render on demand like the rest of the site.

export async function generateMetadata({ params }: Props) {
  const topic = findBlogTopic((await params).topic)
  if (!topic) notFound()
  return {
    title: `${topic.label} · Blog`,
    description: `AT Protocol blog posts about ${topic.label}.`,
  }
}

export default async function BlogTopicPage({ params }: Props) {
  const topic = findBlogTopic((await params).topic)
  if (!topic) notFound()
  return <BlogIndex topic={topic.id} subtitle={`Posts about ${topic.label}`} />
}
