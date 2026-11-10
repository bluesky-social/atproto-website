import Link from 'next/link'
import type { BlogPost } from '@/lib/posts'

export function BlogPostCard({
  post,
  headingLevel = 2,
}: {
  post: BlogPost
  headingLevel?: 2 | 3
}) {
  const Title = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <article className="group rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700">
      <Link href={`/blog/${post.slug}`} className="block">
        <time
          dateTime={new Date(post.date).toISOString().slice(0, 10)}
          className="text-sm text-zinc-500 dark:text-zinc-500"
        >
          {post.date}
        </time>
        <Title className="mt-2 text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {post.title}
        </Title>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {post.description}
        </p>
        {post.author && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
            By {post.author}
          </p>
        )}
      </Link>
    </article>
  )
}
