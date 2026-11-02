// Stable IDs are used in metadata, queries and URLs; labels can change independently.
export const blogTopics = [
  { id: 'spaces', label: 'Spaces' },
  { id: 'identity', label: 'Identity & auth' },
  { id: 'sync', label: 'Sync & streaming' },
  { id: 'hosting', label: 'Hosting & infrastructure' },
  { id: 'sdks', label: 'SDKs & tooling' },
  { id: 'lexicons', label: 'Lexicons & records' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'feeds', label: 'Feeds' },
  { id: 'governance', label: 'Standards & governance' },
  { id: 'roadmap', label: 'Roadmaps & progress' },
  { id: 'grants', label: 'Grants' },
  { id: 'news', label: 'News & announcements' },
]

// OAuth is part of Identity & auth; retain existing query links as an alias.
function canonicalTag(tag) {
  const id = tag.trim().toLowerCase()
  return id === 'oauth' ? 'identity' : id
}

/** @param {unknown} value @returns {string[]} */
export function normalizeBlogTags(value) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((tag) => typeof tag !== 'string')) {
    throw new Error('Tags must be an array of topic IDs')
  }
  const tags = [...new Set(value.map(canonicalTag))]
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
      tags.push(canonicalTag(tag))
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

/** @param {string[] | undefined} tags @param {string[]} selected */
export function matchesBlogTags(tags, selected) {
  return selected.every((tag) => (tags ?? []).includes(tag))
}
