import { Page } from '@/components/Page'
import * as content from './en.mdx'

// Metadata comes from the MDX header (see mdx.d.ts). en.mdx is imported
// statically — not translated, and the module edge is what makes content
// edits hot-reload.

export function generateMetadata() {
  return {
    title: content.header.title,
    description: content.header.description,
  }
}

export default function HomePage() {
  return <Page {...content} />
}
