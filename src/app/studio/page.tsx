import Link from 'next/link'
import { notFound } from 'next/navigation'

export const metadata = { title: 'Studio' }

const TOOLS = [
  {
    href: '/studio/blog',
    title: 'Blog',
    body: 'Write, edit, and delete posts. Publishes a standard.site record on save.',
  },
  {
    href: '/studio/podcast',
    title: 'Podcast',
    body: 'Off Protocol episodes: metadata, R2 audio upload, show notes, OG image.',
  },
]

export default function StudioIndexPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <main className="mx-auto max-w-2xl px-8 py-20">
      <h1 className="text-4xl font-semibold tracking-tight">Studio</h1>
      <p className="mt-3 text-lg text-neutral-500">
        Authoring tools for this site. Development only — the pages and their API
        routes 404 in production, and every change lands as files in your working
        tree for you to review and commit.
      </p>
      <ul className="mt-10 flex flex-col gap-3">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="block rounded-lg border border-neutral-200 px-5 py-4 transition hover:border-neutral-400 hover:bg-neutral-50"
            >
              <span className="text-base font-medium">{tool.title} →</span>
              <span className="mt-1 block text-sm text-neutral-500">{tool.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
