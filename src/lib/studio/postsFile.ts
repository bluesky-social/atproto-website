export type PostEntry = {
  slug: string
  title: string
  description: string
  date: string
  author?: string
}

const ANCHOR = 'export const posts: BlogPost[] = ['

function q(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function renderEntry(entry: PostEntry): string {
  const lines = [
    `  {`,
    `    slug: ${q(entry.slug)},`,
    `    title: ${q(entry.title)},`,
    `    description: ${q(entry.description)},`,
    `    date: ${q(entry.date)},`,
  ]
  if (entry.author) lines.push(`    author: ${q(entry.author)},`)
  lines.push(`  },`)
  return lines.join('\n')
}

// Match a single object literal entry that contains the given slug, including
// its trailing comma and surrounding whitespace/newline.
function entryRegex(slug: string): RegExp {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\n? *\\{[^{}]*slug:\\s*'${escaped}'[^{}]*\\},?`, 's')
}

export function hasEntry(source: string, slug: string): boolean {
  return entryRegex(slug).test(source)
}

export function prependEntry(source: string, entry: PostEntry): string {
  if (!source.includes(ANCHOR)) {
    throw new Error(`Could not find posts array anchor: ${ANCHOR}`)
  }
  return source.replace(ANCHOR, `${ANCHOR}\n${renderEntry(entry)}`)
}

export function updateEntryBySlug(
  source: string,
  slug: string,
  entry: PostEntry,
): string {
  const re = entryRegex(slug)
  if (!re.test(source)) {
    throw new Error(`Post entry not found for slug: ${slug}`)
  }
  return source.replace(re, `\n${renderEntry(entry)}`)
}

export function removeEntryBySlug(source: string, slug: string): string {
  const re = entryRegex(slug)
  if (!re.test(source)) return source
  return source.replace(re, '')
}
