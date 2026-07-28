import { mdxAnnotations } from 'mdx-annotations'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'

// Smart typography applies ONLY to blog posts and Off Protocol podcast content.
// All other MDX (docs, specs, lexicons) must render straight quotes/dashes
// verbatim, so we gate on the VFile path segment.
export const SMART_TYPOGRAPHY_PATHS = /[\\/](blog|off-protocol)[\\/]/

// Annotated so the literal `dashes` value keeps its type for TS consumers —
// src/lib/studio/smartText.ts feeds this same object to retext-smartypants.
/** @type {import('retext-smartypants').Options} */
export const SMART_TYPOGRAPHY_OPTIONS = {
  quotes: true,
  dashes: 'inverted', // `--` → em (—), `---` → en (–)
  ellipses: true,
}

// Wrap remark-smartypants so it runs only for blog/podcast files. The inner
// transformer is built once; each MDX file's path decides whether it runs.
export function remarkSmartTypographyScoped(options) {
  const transform = remarkSmartypants(options)
  return (tree, file) => {
    if (SMART_TYPOGRAPHY_PATHS.test(file?.path ?? '')) {
      return transform(tree, file)
    }
  }
}

export const remarkPlugins = [
  mdxAnnotations.remark,
  remarkGfm,
  [remarkSmartTypographyScoped, SMART_TYPOGRAPHY_OPTIONS],
]
