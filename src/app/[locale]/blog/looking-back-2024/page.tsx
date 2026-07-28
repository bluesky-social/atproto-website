import { Page } from '@/components/Page'
import * as content from './en.mdx'

// Blog posts aren't translated (crowdin.yml covers guides/articles/specs only),
// so this imports en.mdx statically. That gives the route a real module-graph
// edge — which is what lets a content edit hot-reload — and lets the metadata
// come from the header instead of being a second copy that can drift from it.

export function generateMetadata() {
  return {
    title: content.header?.title,
    description: content.header?.description,
  }
}

export default function BlogPost() {
  return <Page {...content} />
}
