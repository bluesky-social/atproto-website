import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'

/**
 * Convert raw MDX body content (with the leading `export const header = …`
 * stripped) into plain HTML suitable for an RSS <content:encoded> CDATA
 * block.
 *
 * Intentionally markdown-only: custom MDX components (e.g., <Bento>) are
 * not rendered. Podcatchers strip non-trivial HTML anyway, and rendering
 * full MDX server-side adds complexity for no listener benefit.
 */
export async function mdxBodyToHtml(rawMdxBody: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeStringify, { allowDangerousHtml: false })
    .process(rawMdxBody)

  return String(file)
}

/**
 * Strip MDX header and import/export lines from a raw .mdx file's contents
 * so the remaining string can be parsed as plain markdown.
 *
 * - Removes the leading `export const header = { … }` block (multiline).
 * - Removes any other top-level `export` or `import` lines.
 *
 * The blog/podcast convention places the header at the very top, so this
 * is sufficient. We do NOT try to be a general MDX parser.
 */
export function stripMdxFrontmatter(rawMdx: string): string {
  let out = rawMdx

  // Remove `export const header = { ... };?` (with balanced braces, naive).
  out = out.replace(/^\s*export\s+const\s+header\s*=\s*\{[\s\S]*?\n\}\s*;?\s*\n/m, '')

  // Remove any remaining top-level `export …` or `import …` lines.
  out = out
    .split('\n')
    .filter((line) => !/^(export|import)\s/.test(line))
    .join('\n')

  return out.trim()
}
