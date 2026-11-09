import type { Metadata } from 'next'
import { Page } from '@/components/Page'
import { mdxRouteMetadata } from '@/lib/localizedMdx'
import * as content from './en.mdx'

export function generateMetadata(): Metadata {
  const { title, description } = mdxRouteMetadata(content)
  return {
    title,
    description,
    authors: [{ name: content.header.author }],
    openGraph: {
      title,
      description,
      type: 'article',
      url: '/blog/ai-on-atproto',
      siteName: 'AT Protocol',
      publishedTime: '2026-11-10',
      authors: [content.header.author],
      tags: ['ai'],
      images: [{ url: '/default-social-card.png', width: 1200, height: 630 }],
    },
  }
}

export default function BlogPost() {
  return <Page {...content} />
}
