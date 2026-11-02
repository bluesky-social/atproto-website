// Stable IDs are used in metadata, queries and URLs; labels can change independently.
export const blogTopics = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'identity', label: 'Identity & accounts' },
  { id: 'oauth', label: 'OAuth' },
  { id: 'sync', label: 'Sync & streaming' },
  { id: 'hosting', label: 'Hosting & infrastructure' },
  { id: 'sdks', label: 'SDKs & tooling' },
  { id: 'lexicons', label: 'Lexicons & records' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'feeds', label: 'Feeds' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'governance', label: 'Standards & governance' },
  { id: 'roadmap', label: 'Roadmaps & progress' },
  { id: 'tutorials', label: 'Tutorials' },
]

/** @param {unknown} value @returns {string[]} */
export function normalizeBlogTags(value) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== 'string')) {
    throw new Error('Tags must be an array of topic IDs')
  }
  const tags = [...new Set(value.map((tag) => tag.trim().toLowerCase()))]
  for (const tag of tags) {
    if (!blogTopics.some((topic) => topic.id === tag))
      throw new Error(`Unknown blog tag: ${tag}`)
  }
  return tags
}

/** @param {string} query */
export function parseBlogQuery(query) {
  const tags = []
  const text = query
    .replace(/(?:^|\s)tag:([^\s]+)/gi, (_, tag) => {
      tags.push(tag.toLowerCase())
      return ' '
    })
    .trim()
    .replace(/\s+/g, ' ')
  return { text, tags: [...new Set(tags)] }
}

/** @param {string} text @param {string[]} tags */
export function formatBlogQuery(text, tags) {
  return [text.trim(), ...tags.map((tag) => `tag:${tag}`)]
    .filter(Boolean)
    .join(' ')
}

/** @param {string} query */
export function blogSearchHref(query) {
  return query ? `/blog?${new URLSearchParams({ q: query })}` : '/blog'
}
