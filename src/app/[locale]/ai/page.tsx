import type { Metadata } from 'next'
import Link from 'next/link'
import { posts } from '@/lib/posts'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'AI',
  description:
    'Agents you can trace back to a person. Explore ident.link, a draft spec for linking agents to the people responsible for them on AT Protocol.',
}

// Uses the blog topic-filter URL format, available when this page ships.
const agentBlogHref = '/blog?q=tag%3Aai'

// Keep the designed feature visible until its post and AI tags are published.
// Published AI posts use archive metadata and appear newest first.
const taggedPosts = posts
  .filter((post) => post.tags?.includes('ai'))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
const aiPosts =
  taggedPosts.length > 0
    ? taggedPosts.map((post) => ({
        ...post,
        href: `/blog/${post.slug}`,
      }))
    : [
        {
          title: 'AI on Atproto: Our Approach',
          description:
            'We built the AT Protocol so that people, not platforms, hold the keys to their online lives. That same commitment shapes how we think about AI.',
          detail:
            ' This post lays out the values behind our approach, how they show up in what we build, and why we think atproto is well suited to a web where AI agents are everywhere.',
          date: undefined,
          href: agentBlogHref,
        },
      ]

const steps = [
  {
    title: 'The agent names its principal',
    description:
      'The agent lists the person responsible for it in its DID document. For did:plc accounts, every change to that document is signed and published in an audit log.',
    code: '"alsoKnownAs": [\n  "at://agent.bob.com",\n  "https://ident.link/agent-of/did:plc:bob"\n]',
  },
  {
    title: 'The principal endorses the agent',
    description:
      'The principal confirms the relationship with a record in their own repository, keyed by the agent’s DID.',
    code: '// at://did:plc:bob/link.ident.endorsement/did:plc:agent\n{\n  "$type": "link.ident.endorsement",\n  "agent": "did:plc:agent"\n}',
  },
  {
    title: 'Anyone can verify both halves',
    description:
      'Resolve the agent’s DID, fetch the endorsement from the principal’s repository, and check that it names the agent. If either half is missing, the link is unconfirmed.',
    code: '// 1. Resolve did:plc:agent and collect its ident.link/agent-of entries\n// 2. Fetch link.ident.endorsement/did:plc:agent from the principal’s repo\n//    (for example via com.atproto.sync.getRecord)\n// 3. Confirm the record’s agent field equals did:plc:agent',
  },
]

function Actions() {
  return (
    <div className={styles.actions}>
      <a href="https://ident.link" className={styles.primary}>
        Explore ident.link <span aria-hidden="true">→</span>
      </a>
      <Link href={agentBlogHref} className={styles.secondary}>
        Read the blog
      </Link>
    </div>
  )
}

function ChatExample() {
  return (
    <figure
      className={styles.chat}
      aria-label="Illustrative group chat showing an agent’s confirmed link to Bob"
    >
      <figcaption className={styles.chatHeader}>
        <strong>Group Chat</strong>
        <span>3 people · 1 agent</span>
      </figcaption>
      <div className={styles.messages}>
        <div className={styles.message}>
          <span
            className={`${styles.avatar} ${styles.alice}`}
            aria-hidden="true"
          >
            A
          </span>
          <div className={styles.messageBody}>
            <p className={styles.sender}>
              <strong>Alice</strong> <span>@alice.example</span>
            </p>
            <p className={styles.bubble}>
              Does anyone know what time works for everyone on Saturday?
            </p>
          </div>
        </div>
        <div className={styles.message}>
          <span
            className={`${styles.avatar} ${styles.robot}`}
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <rect x="4" y="7" width="16" height="12" rx="3" />
              <path d="M12 3v4M9 12h.01M15 12h.01M9.5 16h5" />
            </svg>
          </span>
          <div className={styles.messageBody}>
            <p className={styles.sender}>
              <strong>Bob’s agent</strong> <span>@agent.bob.com</span>
              <span className={styles.badge}>Agent of @bob.com</span>
            </p>
            <p className={styles.bubble}>
              Bob is free from 10am to 2pm. I can hold that window on his
              calendar if it works for you two.
            </p>
            <div className={styles.identity}>
              <div className={styles.person}>
                <span
                  className={`${styles.avatar} ${styles.bob}`}
                  aria-hidden="true"
                >
                  B
                </span>
                <div>
                  <strong>Bob</strong>
                  <span>@bob.com</span>
                </div>
              </div>
              <p>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>{' '}
                Bob confirmed this agent with ident.link
              </p>
              <span className={styles.profile}>
                View @bob.com <span aria-hidden="true">→</span>
              </span>
            </div>
          </div>
        </div>
        <div className={styles.message}>
          <span
            className={`${styles.avatar} ${styles.carol}`}
            aria-hidden="true"
          >
            C
          </span>
          <div className={styles.messageBody}>
            <p className={styles.sender}>
              <strong>Carol</strong> <span>@carol.example</span>
            </p>
            <p className={styles.bubble}>10am works for me.</p>
          </div>
        </div>
      </div>
      <div className={styles.composer} aria-hidden="true">
        <span>Message the group</span>
      </div>
    </figure>
  )
}

export default function AIPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero} aria-labelledby="ai-title">
          <div className={styles.intro}>
            <a href="https://ident.link" className={styles.announcement}>
              <span>New</span> ident.link: a draft spec for linking agents to
              the people responsible for them
            </a>
            <h1 id="ai-title">Agents you can trace back to a person</h1>
            <p>
              On atproto, agents and people share an identity layer. With
              ident.link, an agent names the person or organization responsible
              for it, that person confirms it from their own account, and anyone
              can check the link.
            </p>
            <Actions />
          </div>
          <ChatExample />
        </section>
        <section
          className={`${styles.section} ${styles.blog}`}
          aria-labelledby="from-the-blog"
        >
          <h2 id="from-the-blog">Blog posts</h2>
          <Link href={agentBlogHref} className={styles.viewAll}>
            View all posts <span aria-hidden="true">→</span>
          </Link>
          <div className={styles.postList}>
            {aiPosts.map((post, index) => (
              <article key={post.href} className={styles.featuredPost}>
                <div className={styles.postHeading}>
                  {index === 0 && <span className={styles.latest}>Latest</span>}
                  <h3>
                    <Link href={post.href}>{post.title}</Link>
                  </h3>
                </div>
                <p className={styles.postDescription}>
                  {post.description}
                  {'detail' in post && (
                    <span className={styles.postDetail}>{post.detail}</span>
                  )}
                </p>
                {post.date ? (
                  <time
                    className={styles.postDate}
                    dateTime={new Date(post.date).toISOString().slice(0, 10)}
                  >
                    {post.date}
                  </time>
                ) : (
                  <span className={styles.postDate}>[Date]</span>
                )}
                <Link href={post.href} className={styles.readPost}>
                  Read post <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className={styles.section} aria-labelledby="how-it-works">
          <h2 id="how-it-works">How ident.link works</h2>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <div>
                  <span className={styles.number} aria-hidden="true">
                    0{index + 1}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <pre>
                  <code>{step.code}</code>
                </pre>
              </li>
            ))}
          </ol>
        </section>
        <section
          className={styles.explanation}
          aria-label="Understanding confirmed links"
        >
          <div>
            <h2>What a confirmed link means</h2>
            <p>
              A confirmed link tells you who is responsible for an agent. It
              gives the agent no authority to act on that person’s behalf.
              Either side can end it at any time: the principal deletes the
              endorsement, or the agent removes the entry from its DID document.
            </p>
          </div>
          <div>
            <h2>Keep the link out of your agent’s hands</h2>
            <p>
              Your agent needs to write records, but it rarely needs to change
              its own DID document. Give it OAuth <code>repo</code> and{' '}
              <code>blob</code> scopes without the <code>identity</code> scope,
              or an app password, and it can post freely but can’t alter its own
              declaration.
            </p>
          </div>
        </section>
        <section className={styles.section} aria-labelledby="why-atproto">
          <h2 id="why-atproto">Why atproto works for agents</h2>
          <div className={styles.benefits}>
            <article>
              <svg
                aria-hidden="true"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
              </svg>
              <h3>One identity layer</h3>
              <p>
                Every account has a portable, cryptographic identity that works
                across every app on the network. An agent gets its own identity
                in the same system people use, so it can be recognized wherever
                you run into it.
              </p>
            </article>
            <article>
              <svg
                aria-hidden="true"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <ellipse cx="12" cy="6" rx="8" ry="3" />
                <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
              </svg>
              <h3>A public record of what agents do</h3>
              <p>
                Public activity lives in signed repositories and flows through
                an open firehose. Anyone can build tools to audit, label or
                filter agent activity.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="get-started">
          <div>
            <h2 id="get-started">Show who’s behind your agent</h2>
            <p>
              ident.link is a draft. If you’re building agents, help shape how
              they identify themselves on an open network.
            </p>
          </div>
          <Actions />
        </section>
      </div>
    </div>
  )
}
