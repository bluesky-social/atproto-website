'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation, stripLocalePrefix } from './Navigation'
import clsx from 'clsx'

export function SubpageLinks() {
  const rawPathname = usePathname()
  const pathname = stripLocalePrefix(rawPathname)

  for (const group of navigation) {
    for (const link of group.links) {
      if (link.href === pathname && link.links && link.links.length > 0) {
        return (
          <div className="px-4 pt-4 md:pt-8 md:px-16">
            <div className="pb-2 font-medium md:hidden">Pages:</div>
            <div className={clsx(
              "flex flex-wrap gap-2",
              "flex-col md:flex-row"
            )}>
              {link.links.map((sublink) => (
                <Link
                  key={sublink.href}
                  href={sublink.href}
                  className={clsx(
                    "border border-zinc-200 px-4 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
                    "rounded-sm md:rounded-full md:text-sm",
                    "py-3 md:py-1.5"
                  )}
                >
                  {sublink.title}
                </Link>
              ))}
            </div>
          </div>
        )
      }
    }
  }

  return null
}
