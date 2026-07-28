import Link from 'next/link'

const ITEMS = [
  { href: '/studio/blog', label: 'Blog', key: 'blog' },
  { href: '/studio/podcast', label: 'Podcast', key: 'podcast' },
] as const

/**
 * The switch between the two editors. Lives at the top of each editor's
 * sidebar so you never have to know the other URL by heart.
 */
export function StudioNav({ active }: { active: 'blog' | 'podcast' }) {
  return (
    <div className="mb-6">
      <Link
        href="/studio"
        className="mb-3 block text-sm font-semibold tracking-tight text-neutral-900"
      >
        Studio
      </Link>
      <nav className="flex gap-1 rounded-md border border-neutral-200 p-0.5">
        {ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.key === active ? 'page' : undefined}
            className={
              'flex-1 rounded px-2 py-1 text-center text-sm transition ' +
              (item.key === active
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:bg-neutral-900/[0.04] hover:text-neutral-900')
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
