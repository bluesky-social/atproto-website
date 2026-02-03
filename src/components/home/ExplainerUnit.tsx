'use client'

import clsx from 'clsx'
import { ButtonArrowIcon } from '../Button'
import Link from 'next/link'
import { createContext, useContext, useState } from 'react'

const NavContext = createContext('json')
const SyntaxHighlightContext = createContext(true)

interface NavItem {
  id: string
  title: string
  description: string
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'json',
    title: "It's just JSON",
    description:
      'The AT Protocol is a data network. Posts, likes, follows, profiles, etc, are all just JSON.',
  },
  {
    id: 'types',
    title: 'Strongly typed',
    description: 'Compose records with type definitions based on JSON Schema.',
  },
  {
    id: 'links',
    title: 'Hyperlinked',
    description:
      'Everything has a URL. Everyone posts from their own account. Everything is interlinked.',
  },
  {
    id: 'checksums',
    title: 'With checksums',
    description: "Use content-IDs to create strong links to other users' data.",
  },
]

export function ExplainerUnit() {
  const [current, setCurrent] = useState('json')

  return (
    <div className="relative">
      <ExplainerMobileNav>
        {NAV_ITEMS.map(({ id, title, description }) => (
          <ExplainerMobileNavItem
            key={id}
            id={id}
            title={title}
            description={description}
            current={current}
            setCurrent={setCurrent}
          />
        ))}
      </ExplainerMobileNav>
      <div className="flex flex-col-reverse md:flex-row">
        <NavContext.Provider value={current}>
          <SyntaxHighlightContext.Provider value={current === 'json'}>
            <ExplainerUnitCanvas>
              {/* <ExplainerUnitUrlbar url="at://atproto.com/app.bsky.feed.post/3lrgjkp4jq22l" /> */}
              <JSON>
                <O>
                  <L highlightOn="types">
                    <K>$type</K>&nbsp;<V>app.bsky.feed.post</V>,
                  </L>
                  <L selfIndent>
                    <K>text</K>&nbsp;
                    <V>
                      bsky.storage is an independent project that automates
                      periodic account data backups to a storage network, and
                      has a UI for PLC identity backup and recovery\n\ntools
                      like this give users stronger control of their online
                      future, without needing to self-host an entire PDS
                    </V>
                    ,
                  </L>
                  <L>
                    <K>createdAt</K>&nbsp;<V>2025-06-12T18:13:01.753Z</V>,
                  </L>
                  <O keyname="embed">
                    <L highlightOn="types">
                      <K>$type</K>&nbsp;<V>app.bsky.embed.record</V>,
                    </L>
                    <O keyname="record">
                      <L highlightOn="links">
                        <K>uri</K>
                        &nbsp;
                        <V>
                          at://did:plc:whme2bigebp52jl3456h464d/app.bsky.feed.post/3lrgja7t6uc24
                        </V>
                        ,
                      </L>
                      <L highlightOn="checksums">
                        <K>cid</K>&nbsp;
                        <V>
                          bafyreicjclx66vstawgvawlzrk5sdbjemxmhfheq7guvenfcf7h6kfope4
                        </V>
                      </L>
                    </O>
                  </O>
                  <L>
                    <K>langs</K>&nbsp;[<V>en</V>],
                  </L>
                  <O keyname="facets">
                    <L>
                      <K>index</K>&nbsp;{'{'}&nbsp;<K>byteEnd</K>&nbsp;
                      <V number>12</V>,&nbsp;
                      <K>byteStart</K>&nbsp;<V number>0</V>&nbsp;{'}'},
                    </L>
                    <O keyname="features" array>
                      <O>
                        <L highlightOn="types">
                          <K>$type</K>&nbsp;<V>app.bsky.richtext.facet#link</V>
                        </L>
                        <L>
                          <K>uri</K>&nbsp;<V>https://bsky.storage</V>,
                        </L>
                      </O>
                    </O>
                  </O>
                </O>
              </JSON>
            </ExplainerUnitCanvas>
          </SyntaxHighlightContext.Provider>
        </NavContext.Provider>
        <ExplainerDesktopNav>
          {NAV_ITEMS.map(({ id, title, description }) => (
            <ExplainerDesktopNavItem
              key={id}
              id={id}
              title={title}
              description={description}
              current={current}
              setCurrent={setCurrent}
            />
          ))}
          <ExplainerUnitCTA>LEARN MORE</ExplainerUnitCTA>
        </ExplainerDesktopNav>
      </div>
    </div>
  )
}

function JSON({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="px-4 py-4 font-mono text-sm text-zinc-800 max-md:text-2xs dark:text-zinc-400">
      {children}
    </div>
  )
}

function L({
  children,
  selfIndent,
  highlightOn,
}: React.PropsWithChildren<{ selfIndent?: boolean; highlightOn?: string }>) {
  const currentNav = useContext(NavContext)
  const syntaxHighlight = useContext(SyntaxHighlightContext)
  const shouldHighlight = highlightOn === currentNav
  return (
    <SyntaxHighlightContext.Provider value={shouldHighlight || syntaxHighlight}>
      <div
        className={clsx(
          'rounded-md border border-transparent bg-transparent pl-1 transition-colors duration-300',
          selfIndent && 'pl-5 -indent-4',
          shouldHighlight ? 'md:border-yellow-600 md:bg-yellow-900/30' : '',
        )}
      >
        {children}
      </div>
    </SyntaxHighlightContext.Provider>
  )
}

function O({
  keyname,
  array,
  children,
}: React.PropsWithChildren<{ keyname?: string; array?: boolean }>) {
  return (
    <div className="">
      <L>
        {keyname && <K>{keyname}</K>} {array ? '[' : '{'}
      </L>
      <div className="pl-6">{children}</div>
      <L>{array ? ']' : '}'}</L>
    </div>
  )
}

function K({ children }: React.PropsWithChildren<{}>) {
  return (
    <span>
      <span className={clsx('font-medium')}>&quot;{children}&quot;</span>:
    </span>
  )
}

function V({
  children,
  number,
}: React.PropsWithChildren<{ number?: boolean }>) {
  const syntaxHighlight = useContext(SyntaxHighlightContext)
  return (
    <span
      className={clsx(
        'transition-color duration-300',
        syntaxHighlight ? (number ? 'text-yellow-400' : 'text-yellow-400') : '',
      )}
    >
      {!number && '"'}
      {children}
      {!number && '"'}
    </span>
  )
}

export function ExplainerUnitCanvas({
  dark,
  children,
}: React.PropsWithChildren<{ dark?: boolean }>) {
  return (
    <div
      className={clsx(
        'not-prose relative block overflow-scroll rounded-sm shadow-md shadow-zinc-900/5 ring-1 ring-zinc-900/20 md:w-2/3 dark:ring-zinc-100/15',
        dark &&
        'bg-zinc-900 text-white shadow-zinc-900/30 dark:bg-zinc-800 dark:shadow-zinc-900/90',
      )}
    >
      {children}
    </div>
  )
}

export function ExplainerUnitUrlbar({ url }: { url: string }) {
  return (
    <Link
      className="block rounded-sm px-4 py-3 font-mono text-sm text-blue-600 ring-1 ring-zinc-900/20 hover:underline dark:text-blue-400 dark:ring-zinc-100/15"
      href={`https://pdsls.dev/${url}`}
    >
      {url}
    </Link>
  )
}

export function ExplainerDesktopNav({ children }: React.PropsWithChildren<{}>) {
  return <div className={clsx('flex-1 max-md:hidden')}>{children}</div>
}

export function ExplainerDesktopNavItem({
  id,
  title,
  description,
  current,
  setCurrent,
}: {
  id: string
  title: string
  description: string
  current: string
  setCurrent: React.Dispatch<string>
}) {
  return (
    <div
      className={clsx(
        'ml-1 cursor-pointer border-l-4 py-8 pl-6 transition-colors duration-300 hover:bg-zinc-100/2.5',
        'max-md:hidden',
        id === current
          ? 'border-zinc-200 bg-zinc-100/2.5'
          : 'border-transparent',
      )}
      onClick={() => setCurrent(id)}
    >
      <div
        className={clsx(
          'pb-1 text-2xl font-medium transition-colors duration-300',
          id === current ? 'text-white' : 'text-white/70',
        )}
      >
        {title}
      </div>
      <div className={clsx('text-zinc-700 dark:text-zinc-400')}>
        {description}
      </div>
    </div>
  )
}

export function ExplainerMobileNav({ children }: React.PropsWithChildren<{}>) {
  return (
    <div
      className={clsx(
        'sticky top-[56px] z-20 -mx-8 mb-1 bg-zinc-900/70 backdrop-blur',
      )}
    >
      {children}
    </div>
  )
}

export function ExplainerMobileNavItem({
  id,
  title,
  description,
  current,
  setCurrent,
}: {
  id: string
  title: string
  description: string
  current: string
  setCurrent: React.Dispatch<string>
}) {
  const i = NAV_ITEMS.findIndex((item) => item.id === id)
  return (
    <div
      className={clsx('px-8 md:hidden', id === current ? 'block' : 'hidden')}
      onClick={() => setCurrent(getNextNavItem(id))}
    >
      <div className="rounded-sm px-6 py-6 ring-1 ring-zinc-100/15">
        <div className={clsx('flex-1 pb-1 text-2xl font-medium text-white')}>
          {title}
        </div>
        <div className={clsx('pb-4 text-zinc-700 dark:text-zinc-400')}>
          {description}
        </div>
        <Progress total={4} current={i} />
      </div>
    </div>
  )
}

export function ExplainerUnitCTA({
  className,
  children,
}: React.PropsWithChildren<{
  className?: string
}>) {
  return (
    <div className={clsx('mt-8 flex items-center pl-8 font-medium', className)}>
      <div>{children}</div>
      <ButtonArrowIcon className="relative -mr-1 h-6 w-6" />
    </div>
  )
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 text-xs">
      {[...Array(total)].map((_, i) => (
        <div key={i}>{i === current ? '●' : '○'}</div>
      ))}
      <div className={clsx('flex items-center pl-2 font-medium')}>
        <div>Next</div>
        <ButtonArrowIcon className="relative -mr-1 h-6 w-6" />
      </div>
    </div>
  )
}

function getNextNavItem(id: string): string {
  const i = NAV_ITEMS.findIndex((item) => item.id === id)
  if (i >= NAV_ITEMS.length - 1) {
    return NAV_ITEMS[0].id
  }
  return NAV_ITEMS[i + 1].id
}
