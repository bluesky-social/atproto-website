import Link from 'next/link'
import { blogTopicHref, findBlogTopic } from '@/lib/blogTags.mjs'

// Shown at the end of a post. Low emphasis by design: small, muted, round-rect.
// -mt-12 halves the gap left by the MDX article's pb-24 (shared with all pages).
export function BlogTags({ tags = [] }: { tags?: string[] }) {
  if (!tags.length) return null
  return (
    <nav
      aria-label="Topics"
      className="-mt-12 flex max-w-2xl basis-full flex-wrap items-center gap-2 px-4 pb-12 md:px-16 lg:max-w-3xl"
    >
      <span className="font-mono text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Topics
      </span>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {tags.map((tag) => (
          <li key={tag}>
            <Link
              href={blogTopicHref(tag)}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
            >
              {findBlogTopic(tag)?.label ?? tag}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
