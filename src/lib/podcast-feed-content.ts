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
/**
 * Read `hasShowNotes` from an episode MDX file's `export const header` block.
 * The MDX header is the single source of truth for whether real show notes
 * have been written (the author flips it on alongside the notes); the RSS feed
 * derives note presence from here rather than from a duplicated flag.
 *
 * Scoped to the header block so a mention like "hasShowNotes: true" in the
 * notes prose can't flip it on.
 */
export function readShowNotesFlag(rawMdx: string): boolean {
  const headerMatch = rawMdx.match(
    /export\s+const\s+header\s*=\s*\{[\s\S]*?\n\}/,
  )
  const headerScope = headerMatch ? headerMatch[0] : ''
  return /\bhasShowNotes:\s*true\b/.test(headerScope)
}

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
