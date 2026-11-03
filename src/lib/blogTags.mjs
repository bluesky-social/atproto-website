// Stable IDs are used in metadata, queries and URLs; labels can change independently.
// Order is the display order: News first, then alphabetical by label.
export const blogTopics = [
  { id: 'news', label: 'News & Announcements' },
  { id: 'feeds', label: 'Feeds' },
  { id: 'grants', label: 'Grants' },
  { id: 'hosting', label: 'Hosting & Infrastructure' },
  { id: 'identity', label: 'Identity & Auth' },
  { id: 'lexicons', label: 'Lexicons & Records' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'roadmap', label: 'Roadmaps & Progress' },
  { id: 'sdks', label: 'SDKs & Tooling' },
  { id: 'spaces', label: 'Spaces' },
  { id: 'governance', label: 'Standards & Governance' },
  { id: 'sync', label: 'Sync & Streaming' },
]

// OAuth is part of Identity & Auth; retain existing query links as an alias.
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

/** @param {string} id */
export function blogTopicHref(id) {
  return `/blog/topic/${id}`
}

/** @param {string} id */
export function findBlogTopic(id) {
  return blogTopics.find((topic) => topic.id === id)
}

/** @param {string[] | undefined} tags @param {string[]} selected */
export function matchesBlogTags(tags, selected) {
  return selected.every((tag) => (tags ?? []).includes(tag))
}
