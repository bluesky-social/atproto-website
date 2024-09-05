import Link from 'next/link'
import { Button } from './Button'
import { Tag } from './Tag'

export function ArticleSummary({
  tag,
  title,
  children,
  href,
}: React.PropsWithChildren<{
  tag: string
  title: string
  href: string
}>) {
  return (
    <div>
      <div className="flex items-center gap-x-3">
        <Tag color={tag === 'Guide' ? 'emerald' : 'sky'}>{tag}</Tag>
      </div>
      <h2 className="mt-2 scroll-mt-32">
        <Link href={href}>
          <span className="text-black dark:text-white">{title}</span>
        </Link>
      </h2>
      {children}
      <div className="not-prose mb-12">
        <Button href={href} variant="text" arrow="right">
          <>Keep reading</>
        </Button>
      </div>
    </div>
  )
}

export function ArticleSummarySmall({
  title,
  children,
  href,
}: React.PropsWithChildren<{
  title: string
  href: string
}>) {
  return (
    <div className="not-prose flex flex-row gap-4">
      <div className="pt-2">
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-600 dark:bg-zinc-400" />
      </div>
      <div>
        <h3 className="text-base font-semibold leading-snug dark:text-white">
          <Link href={href}>{title}</Link>
        </h3>
        {children}
      </div>
    </div>
  )
}
