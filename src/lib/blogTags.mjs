// Stable IDs are used in metadata and URLs; labels can change independently.
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
