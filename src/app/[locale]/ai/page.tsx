import type { Metadata } from 'next'
import { BlogPostCard } from '@/components/BlogPostCard'
import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import { PageHeader } from '@/components/PageHeader'
import { posts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Our approach to AI',
  description:
    'We built the AT Protocol so that people, not platforms, hold the keys to their online lives. That same commitment shapes how we think about AI.',
}

const agentBlogHref = '/blog/topic/ai'

const aiPosts = posts
  .filter((post) => post.tags?.includes('ai'))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

const values = [
  {
    title: 'User choice and user control',
    description:
      'You should decide what you see, who you trust, and which tools act on your behalf. No single company should make those decisions for you.',
  },
  {
    title: 'Empowering people to build their own spaces online',
    description:
      "The web is better when people can shape their own corner of it, not just build on someone else's platform.",
  },
  {
    title: 'Diversifying the web',
    description:
      'A healthy internet has many apps, many communities, and many different approaches, all able to interoperate.',
  },
  {
    title: 'Building a healthy information ecosystem',
    description:
      "People need to be able to tell what's real, where it came from, and who is behind it.",
  },
]
const activities = [
  {
    title: 'AI is optional',
    description:
      'No one should have to use AI to use atproto or the apps built on it. The AI features we build will be ones you choose to turn on and can turn off.',
  },
  {
    title: 'Bring your own model',
    description:
      'We support open weight models. People and developers can inspect them, run them on their own infrastructure, and swap them out. Whatever AI features we build, you should be able to plug in your own model instead of being locked into ours.',
  },
  {
    title: 'AI for building, not for noise',
    description:
      "AI is most useful on an open network when it lowers the barrier to making something of your own: a custom feed, a community space, a tool that fits how you work. We aren't interested in making it easier to fill timelines with generated content.",
  },
  {
    title: 'AI for finding what matters',
    description:
      'As the volume of content grows, people need better feeds, filters, search, and moderation. AI can power those tools, and people should be the ones who choose and configure them.',
  },
]

function ValueIcon({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      className="size-6 md:size-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {index === 0 ? (
        <>
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </>
      ) : index === 1 ? (
        <>
          <path d="M4 11l8-6 8 6v9H4z" />
          <path d="M10 20v-5h4v5" />
        </>
      ) : index === 2 ? (
        <>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="6" r="2.5" />
          <circle cx="6" cy="18" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M8.5 6h7M6 8.5v7M18 8.5v7M8.5 18h7" />
        </>
      ) : (
        <>
          <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
          <path d="M8.5 12l2.5 2.5 4.5-5" />
        </>
      )}
    </svg>
  )
}

export default function AIPage() {
  return (
    <div
      id="ai-title"
      className="scroll-mt-14 text-zinc-900 dark:text-zinc-100"
    >
      <PageHeader
        title="Our approach to AI"
        description="We built the AT Protocol so that people, not platforms, hold the keys to their online lives. That same commitment shapes how we think about AI."
        primaryCTA={{ label: 'Read the post', href: '/blog/ai-on-atproto' }}
        secondaryCTA={{ label: 'Blog Posts', href: '#posts' }}
      />
      <div className="flex w-full max-w-2xl flex-col gap-16 px-4 py-12 md:px-16 md:py-16 lg:max-w-5xl">
        <section aria-labelledby="our-values">
          <div className="prose max-w-none dark:prose-invert">
            <Heading id="our-values">Our values</Heading>
            <p className="max-w-3xl">
              The principles that guide our AI work are the same ones that guide
              everything else we build.
            </p>
          </div>
          <div className="mt-8 grid gap-8 xl:grid-cols-2 xl:gap-x-10">
            {values.map((value, index) => (
              <article
                key={value.title}
                className="flex min-w-0 items-start gap-4 md:gap-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center border border-zinc-200 md:size-16 dark:border-zinc-700">
                  <ValueIcon index={index} />
                </span>
                <div className="prose min-w-0 max-w-none dark:prose-invert">
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="what-were-doing">
          <div className="prose max-w-none dark:prose-invert">
            <Heading id="what-were-doing">Our approach to AI</Heading>
          </div>
          <ol
            role="list"
            className="mt-8 list-none divide-y divide-zinc-200 border-y border-zinc-200 p-0 dark:divide-zinc-700 dark:border-zinc-700"
          >
            {activities.map((activity, index) => (
              <li
                key={activity.title}
                className="flex flex-col gap-2 py-6 sm:flex-row sm:gap-8"
              >
                <span
                  className="shrink-0 font-mono text-sm text-zinc-500 sm:w-10 sm:pt-1 dark:text-zinc-400"
                  aria-hidden="true"
                >
                  0{index + 1}
                </span>
                <div className="prose min-w-0 max-w-3xl dark:prose-invert">
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section
          id="posts"
          aria-labelledby="blog-posts"
          className="scroll-mt-24"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div className="prose max-w-none dark:prose-invert">
              <Heading id="blog-posts">Blog Posts</Heading>
            </div>
            <Button href={agentBlogHref} variant="text" arrow="right">
              All blog posts
            </Button>
          </div>
          <div className="space-y-8">
            {aiPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} headingLevel={3} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
