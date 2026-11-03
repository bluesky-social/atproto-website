// Stable IDs are used in metadata and URLs; labels can change independently.
// Order is the display order: News first, then alphabetical by label.
export const blogTopics = [
  { id: 'news', label: 'News & Announcements' },
  { id: 'identity', label: 'Accounts & Auth' },
  { id: 'feeds', label: 'Feeds' },
  { id: 'governance', label: 'Governance' },
  { id: 'lexicons', label: 'Lexicons & Data Schemas' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'sync', label: 'Network Data' },
  { id: 'sdks', label: 'SDKs & Tools' },
  { id: 'hosting', label: 'Self-Hosting' },
  { id: 'spaces', label: 'Spaces & Permissioned Data' },
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

/** @param {string} id */
export function blogTopicHref(id) {
  return `/blog/topic/${id}`
}

/** @param {string} id */
export function findBlogTopic(id) {
  return blogTopics.find((topic) => topic.id === id)
}
