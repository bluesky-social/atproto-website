'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { posts } from '@/lib/posts'
import { blogTopics, parseBlogQuery, formatBlogQuery } from '@/lib/blogTags.mjs'
import { BlogTags } from './BlogTags'

export function BlogListing() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const query = params.get('q') ?? ''
  const { tags } = parseBlogQuery(query)
  const [draft, setDraft] = useState(query)
  const [matched, setMatched] = useState<Set<string> | null>(null)
  const [resolvedQuery, setResolvedQuery] = useState('')
  const [error, setError] = useState(false)
  useEffect(() => {
    setDraft(query)
  }, [query])
  useEffect(() => {
    let active = true
    setError(false)
    if (!query) {
      setMatched(null)
      setResolvedQuery('')
      return
    }
    // Blog routes render English content in every locale. Search the canonical
    // English entries, avoiding translation duplicates or missing fallback posts.
    import('@/mdx/search.mjs')
      .then(({ search }) => {
        const results = search(query, {
          blogsOnly: true,
          distinctPosts: true,
          locale: 'en',
          limit: posts.length,
        })
        if (active) {
          setMatched(
            new Set(results.map((result) => result.url.split('/').pop()!)),
          )
          setResolvedQuery(query)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [query])
  function navigate(next: string) {
    const updated = new URLSearchParams(params.toString())
    if (next) updated.set('q', next)
    else updated.delete('q')
    router.push(`${pathname}${updated.size ? `?${updated}` : ''}`, {
      scroll: false,
    })
  }
  function toggle(tag: string) {
    const parsed = parseBlogQuery(draft)
    navigate(
      formatBlogQuery(
        parsed.text,
        tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
      ),
    )
  }
  const loading = !!query && resolvedQuery !== query && !error
  const visible = query
    ? posts.filter((post) => matched?.has(post.slug))
    : posts
  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(draft.trim())
        }}
        className="mb-6"
      >
        <label htmlFor="blog-search" className="mb-2 block font-medium">
          Search blog posts
        </label>
        <div className="flex gap-2">
          <input
            id="blog-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search posts, or try tag:spaces"
            className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 py-2 dark:border-zinc-700"
          />
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-white"
          >
            Search
          </button>
        </div>
      </form>
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
        {error
          ? 'Search could not load. Please refresh to try again.'
          : loading
            ? 'Searching…'
            : `${visible.length} ${visible.length === 1 ? 'post' : 'posts'}`}
      </p>
      {!loading && !error && (
        <div className="space-y-8">
          {!visible.length && (
            <p>
              No posts match this search. Remove a topic or try different search
              terms.
            </p>
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
      )}
    </>
  )
}
