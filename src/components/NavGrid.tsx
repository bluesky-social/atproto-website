import Link from 'next/link'
import clsx from 'clsx'
import { Icon, type OutlineIconEnum } from '@/components/icons/outline'

export function NavGrid({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav className={clsx('grid gap-6 md:grid-cols-2', className)} {...props} />
  )
}

export function NavGridItem({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description?: string
  href: string
  icon: OutlineIconEnum
}) {
  return (
    <Link className="group flex flex-row items-center gap-6" href={href}>
      <div>
        <div className="rounded-sm p-4 ring-1 ring-zinc-900/15 group-hover:ring-zinc-900/30 dark:ring-zinc-100/15 dark:group-hover:ring-zinc-100/25">
          <Icon
            icon={icon}
            className="size-8 fill-none stroke-current"
            strokeWidth="1.0"
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-2xl font-medium leading-normal">{title}</div>
        {description && (
          <div className="text-zinc-700 dark:text-zinc-400">{description}</div>
        )}
      </div>
    </Link>
  )
}
