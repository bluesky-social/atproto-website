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
    'A new app on atproto can work with existing identities and compatible public records. AI tools can help developers try ideas faster, while shared accounts and data give those ideas something to work with. People can choose which apps to use and who hosts their data.',
}

const agentBlogHref = '/blog/topic/ai'

const aiPosts = posts
  .filter((post) => post.tags?.includes('ai'))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

const activities = [
  {
    title: 'Building apps',
    description:
      'A new app can work with existing accounts and compatible public records. AI coding tools can help developers prototype an interface or workflow faster and test it with data already on the network. Each app still needs to support the record types it uses and earn adoption.',
  },
  {
    title: 'Choosing tools',
    description:
      'Atproto does not require a particular AI provider. Developers can use hosted models or run models themselves. People can choose apps that use AI and apps that don’t.',
  },
  {
    title: 'Finding information',
    description:
      'Developers can build search, feeds, and moderation tools over compatible public records. A community could try a different way to find discussions or filter a feed without asking everyone to create a new account. The app still needs to index the relevant data and give people a reason to use it.',
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
        description="A new app on atproto can work with existing identities and compatible public records. AI tools can help developers try ideas faster, while shared accounts and data give those ideas something to work with. People can choose which apps to use and who hosts their data."
        primaryCTA={{ label: 'Read the post', href: '/blog/ai-on-atproto' }}
        secondaryCTA={{ label: 'Blog posts', href: '#posts' }}
      />
      <div className="flex w-full max-w-2xl flex-col gap-20 px-4 py-12 md:px-16 md:py-16 lg:max-w-5xl">
        <NavGrid aria-label="AI resources">
          <NavGridItem
            icon="robot"
            title="Building agents on atproto"
            description="Accounts, records, and app permissions"
            href="/ai/agent-protocol"
          />
        </NavGrid>
        <section aria-labelledby="what-were-doing">
          <div className="prose max-w-none dark:prose-invert">
            <Heading id="what-were-doing">AI on atproto</Heading>
          </div>
          <div className="prose mt-8 max-w-none dark:prose-invert">
            {activities.map((activity) => (
              <section key={activity.title}>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>
              </section>
            ))}
          </div>
        </section>
        <section
          id="posts"
          aria-labelledby="blog-posts"
          className="scroll-mt-24"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div className="prose max-w-none dark:prose-invert">
              <Heading id="blog-posts">Blog posts</Heading>
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
