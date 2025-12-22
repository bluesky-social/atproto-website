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
import { MobileSearch, Search } from '@/components/Search'
import { ThemeToggle } from '@/components/ThemeToggle'
import LanguageChanger from './LanguageChanger'
import { BlueskyIcon } from './icons/BlueskyIcon'
import { GithubIcon } from './icons/GithubIcon'

function TopLevelNavItem({
  className,
  href,
  children,
}: {
  className?: string
  href: string
  children: React.ReactNode
}) {
  return (
    <li className={className}>
      <Link
        href={href}
        className="text-sm leading-5 text-slate-700 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
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
        'fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-8 px-4 transition sm:px-6 lg:z-30 lg:px-8',
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
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <MobileNavigation />
        </div>
        <Link href="/" aria-label="Home">
          <Logo className="h-6" />
        </Link>
      </div>
      <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-zinc-900/10 lg:dark:bg-white/15" />
      <ul role="list" className="flex items-center gap-8">
        <TopLevelNavItem href="/sdks">About</TopLevelNavItem>
        <TopLevelNavItem href="/sdks">Docs</TopLevelNavItem>
        <TopLevelNavItem href="/sdks" className="hidden sm:block">
          Deploy
        </TopLevelNavItem>
      </ul>
      <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-zinc-900/10 lg:dark:bg-white/15" />
      <Search />
      <div className="hidden flex-1 sm:flex" />
      <div className="flex items-center gap-5">
        <nav className="hidden pr-4 xl:block">
          <ul role="list" className="flex items-center gap-8">
            <TopLevelNavItem href="/sdks">Showcase</TopLevelNavItem>
            <TopLevelNavItem href="https://docs.bsky.app/blog">
              Blog
            </TopLevelNavItem>
          </ul>
        </nav>
        <nav className="hidden md:block">
          <ul role="list" className="flex items-center gap-6">
            <TopLevelNavItem href="https://bsky.app/profile/atproto.com">
              <BlueskyIcon className="h-5 w-5 fill-slate-900 dark:fill-slate-50" />
            </TopLevelNavItem>
            <TopLevelNavItem href="https://github.com/bluesky-social/atproto">
              <GithubIcon className="h-6 w-6 fill-slate-900 dark:fill-slate-50" />
            </TopLevelNavItem>
            <LanguageChanger />
          </ul>
        </nav>
        <div className="hidden md:block md:h-5 md:w-px md:bg-zinc-900/10 md:dark:bg-white/15" />
        <div className="flex gap-4">
          <MobileSearch />
          <ThemeToggle />
        </div>
      </div>
    </motion.div>
  )
})
