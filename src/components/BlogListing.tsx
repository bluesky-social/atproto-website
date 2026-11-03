import Link from 'next/link'
import { posts } from '@/lib/posts'
import { blogTopics } from '@/lib/blogTags.mjs'
import { TopicSelectLoader } from './TopicSelect/TopicSelectLoader'
import { AtprotoPublicationLink } from './AtprotoPublicationLink'

export const BLOG_DESCRIPTION =
  'News, updates, and insights from the AT Protocol team.'

// Shared by /blog and /blog/topic/[topic].
export function BlogIndex({
  topic,
  subtitle = BLOG_DESCRIPTION,
}: {
  topic?: string
  subtitle?: string
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <AtprotoPublicationLink />
      <header className="mb-12">
        <h1 className="font-mono text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          {subtitle}
        </p>
      </header>
      <BlogListing topic={topic} />
    </div>
  )
}

// Server-rendered: the selected topic comes from the route, not the query
// string, so the full list is in the static HTML. <topic-select> enhances the
// form to navigate on change; without JS it submits to /blog/topic.
export function BlogListing({ topic }: { topic?: string }) {
  const visible = topic
    ? posts.filter((post) => post.tags?.includes(topic))
    : posts
  return (
    <>
      <topic-select>
        <form
          method="get"
          action="/blog/topic"
          className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4 text-sm dark:border-zinc-800"
        >
          <h2 className="font-mono text-sm font-medium uppercase tracking-wide text-zinc-700 dark:text-zinc-300">
            Latest posts
          </h2>
          <div className="ml-auto flex items-center gap-3">
            <label
              htmlFor="blog-topic"
              className="text-zinc-600 dark:text-zinc-400"
            >
              Show
            </label>
            <div className="relative">
              <select
                key={topic ?? 'all'}
                id="blog-topic"
                aria-label="Filter blog posts"
                name="topic"
                defaultValue={topic ?? ''}
                className="appearance-none rounded-lg border border-zinc-200 bg-white py-2.5 pl-4 pr-9 font-mono text-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">All posts</option>
                {blogTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
              >
                <path
                  d="m6 8 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <button
              type="submit"
              className="rounded border border-zinc-300 px-2 py-1 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 [@media(scripting:enabled)]:hidden"
            >
              Go
            </button>
          </div>
        </form>
      </topic-select>
      <TopicSelectLoader />
      <div className="space-y-8">
        {!visible.length && <p>No posts on this topic yet.</p>}
        {visible.map((post) => (
          <article
            key={post.slug}
            className="group rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
          >
            <Link href={`/blog/${post.slug}`} className="block">
              <time className="text-sm text-zinc-500 dark:text-zinc-500">
                {post.date}
              </time>
              <h2 className="mt-2 text-xl font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {post.title}
              </h2>
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
        ))}
      </div>
    </>
  )
}
