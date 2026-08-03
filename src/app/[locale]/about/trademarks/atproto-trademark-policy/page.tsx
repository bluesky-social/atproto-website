import { Page } from '@/components/Page'
import { mdxRouteMetadata } from '@/lib/localizedMdx'
import * as content from './en.mdx'

// Metadata comes from the MDX header (see mdx.d.ts). en.mdx is imported
// statically — not translated, and the module edge is what makes content
// edits hot-reload.

export function generateMetadata() {
  return mdxRouteMetadata(content)
}

export default function HomePage() {
  return <Page {...content} />
}
