import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/posts'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Our approach to AI',
  description:
    'We built the AT Protocol so that people, not platforms, hold the keys to their online lives. That same commitment shapes how we think about AI.',
}

const agentBlogHref = '/blog/topic/ai'

const aiPosts = posts
  .filter((post) => post.tags?.includes('ai'))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  .map((post) => ({ ...post, href: `/blog/${post.slug}` }))

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
      width="28"
      height="28"
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
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="ai-title">
        <h1 id="ai-title">Our approach to AI</h1>
        <p>
          We built the AT Protocol so that people, not platforms, hold the keys
          to their online lives. That same commitment shapes how we think about
          AI.
        </p>
        <div className={styles.actions}>
          <Link href="/blog/ai-on-atproto" className={styles.primary}>
            Read the post
          </Link>
          <a href="#posts" className={styles.secondary}>
            Blog Posts
          </a>
        </div>
      </section>
      <div className={styles.content}>
        <section aria-labelledby="our-values">
          <h2 id="our-values">Our values</h2>
          <p className={styles.lead}>
            The principles that guide our AI work are the same ones that guide
            everything else we build.
          </p>
          <div className={styles.values}>
            {values.map((value, index) => (
              <article key={value.title} className={styles.value}>
                <span className={styles.icon}>
                  <ValueIcon index={index} />
                </span>
                <div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="what-were-doing">
          <h2 id="what-were-doing">Our approach to AI</h2>
          <ol className={styles.activities}>
            {activities.map((activity, index) => (
              <li key={activity.title}>
                <span className={styles.number} aria-hidden="true">
                  0{index + 1}
                </span>
                <div>
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section id="posts" aria-labelledby="blog-posts">
          <div className={styles.blogHeader}>
            <h2 id="blog-posts">Blog Posts</h2>
            <Link href={agentBlogHref}>
              All blog posts <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className={styles.postList}>
            {aiPosts.map((post) => (
              <article key={post.href}>
                <Link href={post.href} className={styles.post}>
                  <time
                    dateTime={new Date(post.date).toISOString().slice(0, 10)}
                  >
                    {post.date}
                  </time>
                  <div>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
