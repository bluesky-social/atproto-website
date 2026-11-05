import { blogTopicHref, findBlogTopic } from '@/lib/blogTags.mjs'

// Shared by the <topic-select> element and the no-JS redirect route. Only
// known topic IDs reach a path; anything else goes to the full listing.
export function topicSelectHref(value: string | null): string {
  const topic = value ? findBlogTopic(value) : undefined
  return topic ? blogTopicHref(topic.id) : '/blog'
}
