/**
 * The `page.tsx` written alongside a new blog post.
 *
 * Takes no arguments: the route reads its title and description from the MDX
 * header, so there's nothing to interpolate and nothing that can drift from the
 * content. en.mdx is imported statically — blog posts aren't translated, and the
 * module edge is what lets a content edit hot-reload.
 */
export function blogPageTsx(): string {
  return `import { Page } from '@/components/Page'
import { mdxRouteMetadata } from '@/lib/localizedMdx'
import * as content from './en.mdx'

// Metadata comes from the MDX header (see mdx.d.ts). en.mdx is imported
// statically — not translated, and the module edge is what makes content
// edits hot-reload.

export function generateMetadata() {
  return mdxRouteMetadata(content)
}

export default function BlogPost() {
  return <Page {...content} />
}
`
}
