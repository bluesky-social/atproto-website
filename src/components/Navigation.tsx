'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { Tag } from '@/components/Tag'
import { remToPx } from '@/lib/remToPx'

interface NavLink {
  title: string
  href: string
  links?: Array<NavLink> // Added for subpages
}

interface NavGroup {
  title: string
  links: Array<NavLink>
}

function useInitialValue<T>(value: T, condition = true) {
  let initialValue = useRef(value).current
  return condition ? initialValue : value
}

function TopLevelNavItem({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li className="md:hidden">
      <Link
        href={href}
        className="block py-1 text-sm text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        {children}
      </Link>
    </li>
  )
}

function isExternalLink(href: string) {
  return href.startsWith('http://') || href.startsWith('https://')
}

function NavLink({
  href,
  children,
  tag,
  active = false,
  isAnchorLink = false,
  isSubpage = false,
}: {
  href: string
  children: React.ReactNode
  tag?: string
  active?: boolean
  isAnchorLink?: boolean
  isSubpage?: boolean
}) {
  const isExternal = isExternalLink(href)
  const linkProps = isExternal
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex justify-between gap-2 py-1 pr-3 text-base transition',
        isAnchorLink ? 'pl-7' : isSubpage ? 'pl-6' : 'pl-4',
        active
          ? 'text-black dark:text-white'
          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
      )}
      {...linkProps}
    >
      <span className="flex items-center gap-1 truncate">
        {children}
        {isExternal && (
          <svg
            className="inline-block h-3 w-3 opacity-60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </span>
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
    </Link>
  )
}

function ActivePageMarker({
  group,
  pathname,
}: {
  group: NavGroup
  pathname: string
}) {
  let itemHeight = remToPx(2.25)
  let offset = remToPx(0.15)

  // Count all links including subpages
  let allLinks: Array<{ href: string }> = []
  group.links.forEach((link) => {
    allLinks.push(link)
    if (link.links) {
      allLinks.push(...link.links)
    }
  })

  let activePageIndex = allLinks.findIndex((link) => link.href === pathname)
  let top = offset + activePageIndex * itemHeight

  return (
    <motion.div
      layout
      className="absolute left-2 h-8 w-full bg-slate-100 dark:bg-slate-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.2 } }}
      exit={{ opacity: 0 }}
      style={{ top }}
    />
  )
}

function NavigationGroup({
  group,
  className,
}: {
  group: NavGroup
  className?: string
}) {
  // If this is the mobile navigation then we always render the initial
  // state, so that the state does not change during the close animation.
  // The state will still update when we re-open (re-render) the navigation.
  let isInsideMobileNavigation = useIsInsideMobileNavigation()
  let [pathname] = useInitialValue([usePathname()], isInsideMobileNavigation)

  // Check if any link or subpage is active
  let isActiveGroup = group.links.some((link) => {
    if (link.href === pathname) return true
    if (link.links) {
      return link.links.some((sublink) => sublink.href === pathname)
    }
    return false
  })

  return (
    <li className={clsx('relative mt-6', className)}>
      <motion.h2
        layout="position"
        className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300"
      >
        {group.title}
      </motion.h2>
      <div className="relative mt-3 pl-2">
        <motion.div
          layout
          className="absolute inset-y-0 left-2 w-px bg-zinc-900/10 dark:bg-white/5"
        />
        <AnimatePresence initial={false}>
          {isActiveGroup && (
            <ActivePageMarker group={group} pathname={pathname} />
          )}
        </AnimatePresence>
        <ul role="list" className="border-l border-transparent">
          {group.links.map((link) => (
            <motion.li key={link.href} layout="position" className="relative">
              <NavLink href={link.href} active={link.href === pathname}>
                {link.title}
              </NavLink>
              {/* Render subpages */}
              {link.links && link.links.length > 0 && (
                <motion.ul
                  role="list"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { delay: 0.1 },
                  }}
                >
                  {link.links.map((sublink) => (
                    <motion.li
                      key={sublink.href}
                      layout="position"
                      className="relative"
                    >
                      <NavLink
                        href={sublink.href}
                        active={sublink.href === pathname}
                        isSubpage
                      >
                        {sublink.title}
                      </NavLink>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export const navigation: Array<NavGroup> = [
  {
    title: 'About',
    links: [
      { title: 'Introduction', href: '/' },
      { title: 'ATProto Ethos', href: '/articles/atproto-ethos' },
      { title: 'FAQ', href: '/guides/faq' },
    ],
  },
  {
    title: 'Docs',
    links: [
      {
        title: 'Auth',
        href: '/guides/auth',
        links: [
          { title: 'OAuth patterns', href: '/guides/oauth-patterns' },
          { title: 'Scopes', href: '/guides/scopes' },
        ],
      },
      {
        title: 'Reads and Writes',
        href: '/guides/reads-and-writes',
        links: [
          { title: 'Reading data', href: '/guides/reading-data' },
          { title: 'Writing data', href: '/guides/writing-data' },
          {
            title: 'Interaction patterns',
            href: '/guides/interaction-patterns',
          },
        ],
      },
      {
        title: 'Sync',
        href: '/guides/sync',
        links: [
          { title: 'Streaming data', href: '/guides/streaming-data' },
          { title: 'Backfilling', href: '/guides/backfilling' },
        ],
      },
      {
        title: 'Lexicons',
        href: '/guides/lexicon',
        links: [
          { title: 'Installing Lexicons', href: '/guides/installing-lexicons' },
          { title: 'Publishing Lexicons', href: '/guides/publishing-lexicons' },
          { title: 'Lexicon Style Guide', href: '/guides/lexicon-style-guide' },
        ],
      },
      {
        title: 'Images and Video',
        href: '/guides/images-and-video',
        links: [
          { title: 'Lifecycle', href: '/guides/blob-lifecycle' },
          { title: 'Security', href: '/guides/blob-security' },
          { title: 'Video handling', href: '/guides/video-handling' },
        ],
      },
      {
        title: 'Moderation',
        href: '/guides/moderation',
        links: [
          { title: 'Subscriptions', href: '/guides/subscriptions' },
          { title: 'Creating a labeler', href: '/guides/creating-a-labeler' },
          { title: 'Using Ozone', href: '/guides/using-ozone' },
        ],
      },
      { title: 'SDKs', href: '/sdks' },
      {
        title: 'Cookbook',
        href: 'https://github.com/bluesky-social/cookbook/',
      },
      { title: 'Tutorial App', href: '/guides/applications' },
    ],
  },
  {
    title: 'Deploy',
    links: [
      { title: 'The AT Stack', href: '/guides/the-at-stack' },
      { title: 'Self-hosting', href: '/guides/self-hosting' },
      { title: 'Going to production', href: '/guides/going-to-production' },
      { title: 'Account migration', href: '/guides/account-migration' },
      {
        title: 'Deploy recipes',
        href: 'https://github.com/bluesky-social/deploy-recipes/',
      },
    ],
  },
  {
    title: 'Specs',
    links: [
      { title: 'AT Protocol', href: '/specs/atp' },
      { title: 'Data Model', href: '/specs/data-model' },
      { title: 'Lexicon', href: '/specs/lexicon' },
      { title: 'Cryptography', href: '/specs/cryptography' },
      { title: 'Accounts', href: '/specs/account' },
      { title: 'Repository', href: '/specs/repository' },
      { title: 'Blobs', href: '/specs/blob' },
      { title: 'Labels', href: '/specs/label' },
      { title: 'HTTP API (XRPC)', href: '/specs/xrpc' },
      { title: 'OAuth', href: '/specs/oauth' },
      { title: 'Permissions', href: '/specs/permission' },
      { title: 'Event Stream', href: '/specs/event-stream' },
      { title: 'Sync', href: '/specs/sync' },
      { title: 'DID', href: '/specs/did' },
      { title: 'Handle', href: '/specs/handle' },
      { title: 'NSID', href: '/specs/nsid' },
      { title: 'TID', href: '/specs/tid' },
      { title: 'Record Key', href: '/specs/record-key' },
      { title: 'URI Scheme', href: '/specs/at-uri-scheme' },
      { title: 'Glossary', href: '/guides/glossary' },
    ],
  },
]

export function Navigation(props: React.ComponentPropsWithoutRef<'nav'>) {
  return (
    <nav {...props}>
      <ul role="list">
        <TopLevelNavItem href="/">API</TopLevelNavItem>
        <TopLevelNavItem href="#">Documentation</TopLevelNavItem>
        <TopLevelNavItem href="#">Support</TopLevelNavItem>
        {navigation.map((group, groupIndex) => (
          <NavigationGroup
            key={group.title}
            group={group}
            className={groupIndex === 0 ? 'md:mt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
