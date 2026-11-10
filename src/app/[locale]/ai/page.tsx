import type { Metadata } from 'next'
import { BlogPostCard } from '@/components/BlogPostCard'
import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import { NavGrid, NavGridItem } from '@/components/NavGrid'
import { PageHeader } from '@/components/PageHeader'
import { posts } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'AI on atproto',
  description:
    'We built the AT Protocol so that people, not platforms, hold the keys to their online lives. That same commitment shapes how we think about AI.',
}

const agentBlogHref = '/blog/topic/ai'

const aiPosts = posts
  .filter((post) => post.tags?.includes('ai'))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

const activities = [
  {
    title: 'Bring your own model',
    description:
      'We support open weight models. People and developers can inspect them, run them on their own infrastructure, and swap them out. Whatever AI features we build, you should be able to plug in your own model instead of being locked into ours.',
  },
  {
    title: 'For building, not for noise',
    description:
      "AI is most useful on an open network when it lowers the barrier to making something of your own: a custom feed, a community space, a tool that fits how you work. We aren't interested in making it easier to fill timelines with generated content.",
  },
  {
    title: 'Finding what matters',
    description:
      'As the volume of content grows, people need better feeds, filters, search, and moderation. AI can power those tools, and people should be the ones who choose and configure them.',
  },
]

export default function AIPage() {
  return (
    <div
      id="ai-title"
      className="scroll-mt-14 text-zinc-900 dark:text-zinc-100"
    >
      <PageHeader
        title="AI on atproto"
        description="We built the AT Protocol so that people, not platforms, hold the keys to their online lives. That same commitment shapes how we think about AI."
        primaryCTA={{ label: 'Read the post', href: '/blog/ai-on-atproto' }}
        secondaryCTA={{ label: 'Blog Posts', href: '#posts' }}
      />
      <div className="flex w-full max-w-2xl flex-col gap-20 px-4 py-12 md:px-16 md:py-16 lg:max-w-5xl">
        <NavGrid aria-label="AI resources">
          <NavGridItem
            icon="robot"
            title="Agent protocol"
            description="Secure, open agents"
            href="/ai/agent-protocol"
          />
        </NavGrid>
        <section aria-labelledby="what-were-doing">
          <div className="prose max-w-none dark:prose-invert">
            <Heading id="what-were-doing">AI on atproto</Heading>
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
