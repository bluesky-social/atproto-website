import Link from 'next/link'
import { IconContainer } from './IconContainer'
import { ArrowIcon } from './icons/ArrowIcon'

export function CodeCard({
  href,
  description,
  icon,
  children,
}: React.PropsWithChildren<{
  href: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}>) {
  return (
    <div className="not-prose relative rounded-2xl bg-white ring-1 ring-zinc-900/7.5 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 hover:ring-zinc-900/10 dark:bg-zinc-800 dark:ring-zinc-100/7.5 dark:hover:shadow-black/5 dark:hover:ring-zinc-100/10">
      <div className="flex items-center gap-3 px-4 py-3">
        {icon && <IconContainer icon={icon} />}
        <div className="flex-auto">
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-200">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-500">Learn more</span>
          <ArrowIcon className="mr-1 h-7 w-7 text-blue-500" />
        </div>
      </div>
      {children}
      <Link href={href}>
        <span className="absolute inset-0 rounded-2xl" />
      </Link>
    </div>
  )
}
