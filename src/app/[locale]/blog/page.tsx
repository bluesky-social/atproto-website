import Link from 'next/link'

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
 *      date: 'Jan 20, 2026',
 *    }
 *
 *    # Your Post Title
 *
 *    Your markdown content here...
 *    ```
 *
 * 4. Add the post to the `posts` array below (newest first)
 *
 * 5. (Optional) Add translations: pt.mdx, ja.mdx, ko.mdx
 */

const posts = [
  {
    slug: 'welcome-to-the-blog',
    title: 'Welcome to the AT Protocol Blog',
    description: 'Introducing the official AT Protocol blog where we share updates, tutorials, and insights about building on the decentralized social web.',
    date: 'January 20, 2026',
    author: 'AT Protocol Team',
  },
    {
    slug: 'introducing-tap',
    title: 'Introducing Tap: Repository Synchronization Made Simple',
    description: 'We recently released Tap, a tool designed to handle the hard parts of repo synchronization, so you can focus on building your application.',
    date: 'December 12, 2025',
    author: 'Jim Ray',
  },
  {
    slug: 'protocol-check-in-fall-2025',
    title: 'Protocol Check-in (Fall 2025)',
    description: 'The Atmosphere is thriving, here\'s a closer look',
    date: 'October 20, 2025 ',
    author: 'AT Protocol Team',
  },
  {
    slug: 'taking-at-to-the-ietf',
    title: 'Taking AT to the IETF',
    description: 'We recently posted two drafts to the IETF Data Tracker. This is the first major step towards standardizing parts of AT in an effort to establish long-term governance for the protocol.',
    date: 'September 23, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'plc-directory-org',
    title: 'Creating an Independent Public Ledger of Credentials (PLC) Directory Organization',
    description: 'As the next step of maturing governance of the PLC identity system, Bluesky Social PBC is supporting the creation of an independent organization to operate the PLC directory.',
    date: 'September 19, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'oauth-improvements',
    title: 'OAuth Improvements',
    description: 'We\'ve been making improvements to the end-user and developer experiences with atproto OAuth.',
    date: 'June 12, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'network-account-management',
    title: 'Network Account Management',
    description: 'We recently shipped new functionality to the PDS reference implementation (and Bluesky\'s hosting service) which provides a web interface to create and manage accounts directly on the PDS itself.',
    date: 'May 9, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'relay-updates-sync-v1-1',
    title: 'Relay Updates for Sync v1.1',
    description: 'Updates to our reference implementation of the relay support sync version 1.1',
    date: 'May 2, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: '2025-protocol-roadmap-spring',
    title: '2025 Protocol Roadmap (Spring and Summer)',
    description: 'Updates to the AT Protocol roadmap, including Sync v1.1, auth scopes, PDS account management, and more.',
    date: 'March 7, 2025',
    author: 'AT Protocol Team',
  },
  {
    slug: 'looking-back-2024',
    title: 'Looking Back At 2024 AT Protocol Development',
    description: 'A lot of progress was made on the protocol in 2024, here\'s a look at the big milestones',
    date: 'January 10, 2025',
    author: 'AT Protocol Team',
  },
]

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
