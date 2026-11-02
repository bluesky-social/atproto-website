import Link from 'next/link'
import { blogTopics, blogSearchHref } from '@/lib/blogTags.mjs'

export function BlogTags({ tags = [] }: { tags?: string[] }) {
  if (!tags.length) return null
  return (
    <ul aria-label="Topics" className="my-3 flex list-none flex-wrap gap-2 p-0">
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            href={blogSearchHref(`tag:${tag}`)}
            className="rounded-full border border-zinc-300 px-3 py-1 text-sm hover:border-blue-500 dark:border-zinc-700"
          >
            {blogTopics.find((topic) => topic.id === tag)?.label ?? tag}
          </Link>
        </li>
      ))}
    </ul>
  )
}
