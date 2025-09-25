import { forwardRef } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { motion, useScroll, useTransform } from 'framer-motion'

import { Logo } from '@/components/Logo'
import {
  MobileNavigation,
  useIsInsideMobileNavigation,
} from '@/components/MobileNavigation'
import { useMobileNavigationStore } from '@/components/MobileNavigation'
import { SmallSearch } from '@/components/Search'
import { ThemeToggle } from '@/components/ThemeToggle'
import LanguageChanger from './LanguageChanger'

function TopLevelNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm font-medium leading-5 text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

export const Header = forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<typeof motion.div>
>(function Header({ className, ...props }, ref) {
  let { isOpen: mobileNavIsOpen } = useMobileNavigationStore()
  let isInsideMobileNavigation = useIsInsideMobileNavigation()

  let { scrollY } = useScroll()
  let bgOpacityLight = useTransform(scrollY, [0, 72], [0.5, 0.9])
  let bgOpacityDark = useTransform(scrollY, [0, 72], [0.2, 0.8])

  return (
    <motion.div
      {...props}
      ref={ref}
      className={clsx(
        className,
        'fixed inset-x-0 left-0 top-0 z-50 flex h-14 items-center justify-between gap-12 px-4 transition sm:px-6 lg:z-30 lg:px-8',
        !isInsideMobileNavigation && 'backdrop-blur-sm dark:backdrop-blur',
        isInsideMobileNavigation
          ? 'bg-white dark:bg-zinc-900'
          : 'bg-white/[var(--bg-opacity-light)] dark:bg-zinc-900/[var(--bg-opacity-dark)]',
      )}
      style={
        {
          '--bg-opacity-light': bgOpacityLight,
          '--bg-opacity-dark': bgOpacityDark,
        } as React.CSSProperties
      }
    >
      <div
        className={clsx(
          'absolute inset-x-0 top-full h-px transition',
          (isInsideMobileNavigation || !mobileNavIsOpen) &&
            'bg-zinc-900/7.5 dark:bg-white/7.5',
        )}
      />
      <div className="flex items-center gap-8">
        <div className="lg:hidden">
          <MobileNavigation />
        </div>
        <Link href="/" aria-label="Home">
          <Logo className="h-6" />
        </Link>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <ul role="list" className="flex items-center gap-8">
          <TopLevelNavItem href="/developers">Developer Docs</TopLevelNavItem>
        </ul>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <ul role="list" className="flex items-center gap-8">
          <TopLevelNavItem href="/explorer">Network Explorer</TopLevelNavItem>
          <TopLevelNavItem href="/lexicons">Lexicons</TopLevelNavItem>
          <TopLevelNavItem href="/sdks">SDKs</TopLevelNavItem>
          <TopLevelNavItem href="/samples">Samples</TopLevelNavItem>
          <TopLevelNavItem href="/guides/self-hosting">Tools</TopLevelNavItem>
        </ul>
      </div>
      <div className="flex items-center gap-5">
        <nav className="hidden md:block">
          <ul role="list" className="flex items-center gap-8">
            <TopLevelNavItem href="https://docs.bsky.app/blog">
              Blog
            </TopLevelNavItem>
            <TopLevelNavItem href="https://github.com/bluesky-social/atproto">
              GitHub
            </TopLevelNavItem>
            <LanguageChanger />
          </ul>
        </nav>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <div className="flex gap-4">
          <SmallSearch />
          <ThemeToggle />
        </div>
      </div>
    </motion.div>
  )
})
