'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { useIsInsideMobileNavigation } from '@/components/MobileNavigation'
import { Tag } from '@/components/Tag'
import { ChevronRightIcon } from './icons/ChevronRightIcon'
import { ChevronDownIcon } from './icons/ChevronDownIcon'
import { OutlineIconEnum, Icon } from './icons/outline'

interface NavLink {
  title: string
  href: string
  icon?: OutlineIconEnum
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
  icon,
  tag,
  chevron,
  active = false,
  isAnchorLink = false,
  isSubpage = false,
}: {
  href: string
  children: React.ReactNode
  icon?: OutlineIconEnum
  tag?: string
  chevron?: 'right' | 'down'
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
        'my-0.5 flex items-center gap-2 rounded py-1 pl-3 pr-3 transition',
        isAnchorLink ? 'ml-5' : isSubpage ? 'ml-4' : '',
        isSubpage ? 'text-sm' : 'text-md',
        active || !isSubpage
          ? 'text-black dark:text-white'
          : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
        active
          ? 'bg-zinc-100 dark:bg-zinc-800'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800',
      )}
      {...linkProps}
    >
      {icon && (
        <Icon
          icon={icon}
          className="size-[18px] fill-none stroke-black dark:stroke-white"
        />
      )}
      <span className="flex items-center gap-1 truncate">
        {children}
        {isExternal && (
          <svg
            className="opacity-6 ml-0.5 inline-block h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </span>
      <span className="flex-1" />
      {tag && (
        <Tag variant="small" color="zinc">
          {tag}
        </Tag>
      )}
      {chevron == 'right' && (
        <ChevronRightIcon className="size-4 fill-black dark:fill-white" />
      )}
      {chevron == 'down' && (
        <ChevronDownIcon className="size-4 fill-black dark:fill-white" />
      )}
    </Link>
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
  const activePage = group.links.find((link) => {
    if (link.href === pathname) return true
    if (link.links) {
      return link.links.some((sublink) => sublink.href === pathname)
    }
    return false
  })

  return (
    <li
      className={clsx(
        'relative border-b border-zinc-900/10 py-4 dark:border-white/10',
        className,
      )}
    >
      <h2 className="px-3 text-xs font-medium uppercase text-slate-500 dark:text-slate-300">
        {group.title}
      </h2>
      <ul role="list" className="border-l border-transparent">
        {group.links.map((link) => {
          const hasChildren = link.links && link.links.length > 0
          const isExpanded = activePage === link
          return (
            <li key={link.href} className="relative">
              <NavLink
                href={link.href}
                icon={link.icon}
                active={link.href === pathname}
                chevron={
                  hasChildren ? (isExpanded ? 'down' : 'right') : undefined
                }
              >
                {link.title}
              </NavLink>
              {/* Render subpages */}
              {hasChildren && isExpanded && (
                <ul role="list">
                  {link.links!.map((sublink) => (
                    <li key={sublink.href} className="relative">
                      <NavLink
                        href={sublink.href}
                        icon={sublink.icon}
                        active={sublink.href === pathname}
                        isSubpage
                      >
                        {sublink.title}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </li>
  )
}

export const navigation: Array<NavGroup> = [
  {
    title: 'About',
    links: [
      { title: 'Home', icon: 'home', href: '/' },
      { title: 'SDKs', icon: 'cube', href: '/sdks' },
      {
        title: 'Cookbook',
        icon: 'book',
        href: 'https://github.com/bluesky-social/cookbook/',
      },
      {
        title: 'Hello World',
        icon: 'cube',
        href: '/guides/hello-world',
      },
      {
        title: 'Tutorial App',
        icon: 'academic-cap',
        href: '/guides/applications',
      },
      { title: 'FAQ', icon: 'question', href: '/guides/faq' },
      { title: 'ATProto Ethos', href: '/articles/atproto-ethos' },
    ],
  },
  {
    title: 'Docs',
    links: [
      {
        title: 'Auth',
        icon: 'key',
        href: '/guides/auth',
        links: [
          { title: 'SDK authentication', href: '/guides/sdk-auth' },
          { title: 'OAuth patterns', href: '/guides/oauth-patterns' },
          { title: 'Scopes', href: '/guides/scopes' },
        ],
      },
      {
        title: 'Reads and Writes',
        icon: 'database',
        href: '/guides/reads-and-writes',
        links: [
          { title: 'Reading data', href: '/guides/reading-data' },
          { title: 'Writing data', href: '/guides/writing-data' },
        ],
      },
      {
        title: 'Sync',
        icon: 'stream',
        href: '/guides/sync',
        links: [
          { title: 'Streaming data', href: '/guides/streaming-data' },
          { title: 'Backfilling', href: '/guides/backfilling' },
        ],
      },
      {
        title: 'Lexicons',
        icon: 'puzzle-piece',
        href: '/guides/lexicon',
        links: [
          { title: 'Installing Lexicons', href: '/guides/installing-lexicons' },
          { title: 'Publishing Lexicons', href: '/guides/publishing-lexicons' },
          { title: 'Lexicon Style Guide', href: '/guides/lexicon-style-guide' },
        ],
      },
      {
        title: 'Images and Video',
        icon: 'media',
        href: '/guides/images-and-video',
        links: [
          { title: 'Lifecycle', href: '/guides/blob-lifecycle' },
          { title: 'Security', href: '/guides/blob-security' },
          { title: 'Video handling', href: '/guides/video-handling' },
        ],
      },
      {
        title: 'Moderation',
        icon: 'flag',
        href: '/guides/moderation',
        links: [
          { title: 'Labels', href: '/guides/labels' },
          { title: 'Creating a labeler', href: '/guides/creating-a-labeler' },
          { title: 'Subscriptions', href: '/guides/subscriptions' },
          { title: 'Using Ozone', href: '/guides/using-ozone' },
        ],
      },
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
      { title: 'AT Protocol', icon: 'document-text', href: '/specs/atp' },
      { title: 'Data Model', icon: 'document-text', href: '/specs/data-model' },
      { title: 'Lexicon', icon: 'document-text', href: '/specs/lexicon' },
      {
        title: 'Cryptography',
        icon: 'document-text',
        href: '/specs/cryptography',
      },
      { title: 'Accounts', icon: 'document-text', href: '/specs/account' },
      { title: 'Repository', icon: 'document-text', href: '/specs/repository' },
      { title: 'Blobs', icon: 'document-text', href: '/specs/blob' },
      { title: 'Labels', icon: 'document-text', href: '/specs/label' },
      { title: 'HTTP API (XRPC)', icon: 'document-text', href: '/specs/xrpc' },
      { title: 'OAuth', icon: 'document-text', href: '/specs/oauth' },
      {
        title: 'Permissions',
        icon: 'document-text',
        href: '/specs/permission',
      },
      {
        title: 'Event Stream',
        icon: 'document-text',
        href: '/specs/event-stream',
      },
      { title: 'Sync', icon: 'document-text', href: '/specs/sync' },
      { title: 'DID', icon: 'document-text', href: '/specs/did' },
      { title: 'Handle', icon: 'document-text', href: '/specs/handle' },
      { title: 'NSID', icon: 'document-text', href: '/specs/nsid' },
      { title: 'TID', icon: 'document-text', href: '/specs/tid' },
      { title: 'Record Key', icon: 'document-text', href: '/specs/record-key' },
      {
        title: 'URI Scheme',
        icon: 'document-text',
        href: '/specs/at-uri-scheme',
      },
      { title: 'Glossary', icon: 'document-text', href: '/guides/glossary' },
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
            className={groupIndex === 0 ? 'md:pt-0' : ''}
          />
        ))}
      </ul>
    </nav>
  )
}
