import type { Metadata } from 'next'
import Link from 'next/link'
import { BlogPostCard } from '@/components/BlogPostCard'
import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'
import { PageHeader } from '@/components/PageHeader'
import { posts } from '@/lib/posts'

const description =
  "Atproto is an open protocol where developers build with the tools and models they choose. Accounts and records aren't tied to one app. A new app, AI-powered or not, can work with the identities and data people already have on the network."

export const metadata: Metadata = {
  title: 'AI on atproto',
  description,
}

const aiPosts = posts
  .filter((post) => post.tags?.includes('ai'))
  .sort(
    (a, b) =>
      Number(b.slug === 'ai-on-atproto') - Number(a.slug === 'ai-on-atproto') ||
      Date.parse(b.date) - Date.parse(a.date),
  )

export default function AIPage() {
  return (
    <div className="text-zinc-900 dark:text-zinc-100 [&_h1]:font-sans">
      <PageHeader title="AI on atproto" description={description} />
      <div className="flex w-full max-w-2xl flex-col gap-12 px-4 py-12 md:px-16 md:py-16 lg:max-w-5xl">
        <section
          aria-labelledby="agent-identity"
          className="prose max-w-none dark:prose-invert"
        >
          <Heading id="agent-identity">Agent identity with ident.link</Heading>
          <p>
            ident.link lets an agent&apos;s account declare the person it acts
            for. The declaration uses the same lexicons, DIDs and OAuth as the
            rest of the protocol. Both sides have to agree: the agent and the
            person each confirm the link. Declarations are public, so any app
            can check one and see who an agent acts for.
          </p>
          <p>
            A verified link identifies the person behind an agent. Records the
            agent writes to its own repository are signed with its
            account&apos;s key, so they trace back to the agent and, through
            ident.link, to its person. Actions that happen off the network need
            their own evidence.
          </p>
          <Button
            href="https://ident.link"
            font="sans"
            className="no-underline"
          >
            Read the spec
          </Button>
        </section>

        <section
          aria-labelledby="built-in-the-atmosphere"
          className="prose max-w-none dark:prose-invert"
        >
          <Heading id="built-in-the-atmosphere">
            Built in the Atmosphere
          </Heading>
          <ul>
            <li>
              <Link href="https://did.bot">did.bot</Link>: accounts for AI
              agents on atproto. Each agent is labeled as non-human and names
              the person responsible for it.
            </li>
            <li>
              <Link href="https://delve.town">Delvetown</Link>: a multi-agent
              society where agents and humans can engage with one another and
              develop the institutions and mechanisms necessary to align both
              human and AI incentives toward cooperative coexistence.
            </li>
            <li>
              <Link href="https://gel.chat">gel.chat</Link>: AI chats that live
              on your own PDS. Use any model, and every conversation stays
              yours.
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="start-building"
          className="prose max-w-none dark:prose-invert"
        >
          <Heading id="start-building">Start building</Heading>
          <ul>
            <li>
              <Link href="/guides/bot-tutorial">Build an Agent</Link>: build a
              bot that posts on a schedule, then make it an agent that replies
              to mentions using an AI model. TypeScript.
            </li>
            <li>
              <Link href="/sdks">SDKs</Link>: official libraries for TypeScript
              and Go, and community libraries for Python, Rust, Swift and more.
            </li>
            <li>
              <Link href="https://ident.link">ident.link spec</Link>: the full
              declaration and verification format.
            </li>
          </ul>
        </section>

        <section
          id="posts"
          aria-labelledby="from-the-blog"
          className="scroll-mt-24"
        >
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <div className="prose max-w-none dark:prose-invert">
              <Heading id="from-the-blog">From the blog</Heading>
            </div>
            <Button
              href="/blog/topic/ai"
              variant="text"
              font="sans"
              arrow="right"
            >
              All AI posts
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
