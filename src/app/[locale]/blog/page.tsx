import Link from 'next/link'
import { posts } from '@/lib/posts'

/**
 * Blog Post Listing
 *
 * HOW TO ADD A NEW BLOG POST:
 *
 * The easiest way is to run
 *
 * npm run blog
 *
 * From the root directory of this application
 *
 * 1. Create a new directory: src/app/[locale]/blog/your-post-slug/
 *
 * 2. Add page.tsx (copy from an existing post and update metadata)
 *
 * 3. Add en.mdx with your content:
 *    ```
 *    export const header = {
 *      title: 'Your Post Title',
 *      description: 'Your post description',
 *      date: 'January 20, 2026',
 *    }
 *
 *    # Your Post Title
 *
 *    Your markdown content here...
 *    ```
 *
 * 4. Add the post to the `posts` array in src/lib/posts.ts (newest first)
 *
 * 5. (Optional) Add translations: pt.mdx, ja.mdx, ko.mdx
 */

export const metadata = {
  title: 'Blog',
  description: 'News, updates, and insights from the AT Protocol team.',
}

export default async function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <header className="mb-12">
        <h1 className="font-mono text-4xl font-bold uppercase tracking-tight md:text-5xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          News, updates, and insights from the AT Protocol team.
        </p>
      </header>

      <div className="space-y-8">
        {posts.map((post) => (
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
    </div>
  )
}
