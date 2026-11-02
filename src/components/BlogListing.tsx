'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { posts } from '@/lib/posts'
import {
  blogTopics,
  parseBlogQuery,
  formatBlogQuery,
  matchesBlogTags,
} from '@/lib/blogTags.mjs'
import { BlogTags } from './BlogTags'

export function BlogListing() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const query = params.get('q') ?? ''
  const { tags } = parseBlogQuery(query)
  function navigate(next: string) {
    const updated = new URLSearchParams(params.toString())
    if (next) updated.set('q', next)
    else updated.delete('q')
    router.push(`${pathname}${updated.size ? `?${updated}` : ''}`, {
      scroll: false,
    })
  }
  function toggle(tag: string) {
    navigate(
      formatBlogQuery(
        '',
        tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
      ),
    )
  }
  const visible = posts.filter((post) => matchesBlogTags(post.tags, tags))
  return (
    <>
      <fieldset className="mb-6">
        <legend className="mb-2 font-medium">Filter by topic</legend>
        <div className="flex flex-wrap gap-2">
          {blogTopics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              aria-pressed={tags.includes(topic.id)}
              onClick={() => toggle(topic.id)}
              className={`rounded-full border px-3 py-1 text-sm ${tags.includes(topic.id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}
            >
              {topic.label} (
              {posts.filter((post) => post.tags?.includes(topic.id)).length})
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Posts must match every selected topic.
        </p>
      </fieldset>
      {query && (
        <div className="mb-4 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className="text-sm text-blue-600 dark:text-blue-400"
            >
              Remove {tag} ×
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate('')}
            className="text-sm underline"
          >
            Clear all
          </button>
        </div>
      )}
      <p role="status" className="mb-6 text-sm text-zinc-500">
        {`${visible.length} ${visible.length === 1 ? 'post' : 'posts'}`}
      </p>
      <div className="space-y-8">
        {!visible.length && (
          <p>No posts match these topics. Remove a topic to see more posts.</p>
        )}
        {visible.map((post) => (
          <article
            key={post.slug}
            className="group rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <time className="text-sm text-zinc-500">{post.date}</time>
              <h2 className="mt-2 text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {post.title}
              </h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {post.description}
              </p>
              {post.author && (
                <p className="mt-4 text-sm text-zinc-500">By {post.author}</p>
              )}
            </Link>
            <BlogTags tags={post.tags} />
          </article>
        ))}
      </div>
    </>
  )
}
