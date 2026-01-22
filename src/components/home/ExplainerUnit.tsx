'use client'

import clsx from 'clsx'
import { ButtonArrowIcon } from '../Button'
import Link from 'next/link'
import { createContext, useContext, useState } from 'react'

const NavContext = createContext('json')
const SyntaxHighlightContext = createContext(true)

export function ExplainerUnit() {
  const [current, setCurrent] = useState('json')

  return (
    <>
      <div className="flex">
        <NavContext.Provider value={current}>
          <SyntaxHighlightContext.Provider value={current === 'json'}>
            <ExplainerUnitCanvas>
              {/* <ExplainerUnitUrlbar url="at://atproto.com/app.bsky.feed.post/3lrgjkp4jq22l" /> */}
              <JSON>
                <O>
                  <L highlightOn="types">
                    <K>$type</K> <V>app.bsky.feed.post</V>,
                  </L>
                  <L selfIndent>
                    <K>text</K>{' '}
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
                    <K>createdAt</K> <V>2025-06-12T18:13:01.753Z</V>,
                  </L>
                  <O keyname="embed">
                    <L highlightOn="types">
                      <K>$type</K> <V>app.bsky.embed.record</V>,
                    </L>
                    <O keyname="record">
                      <L highlightOn="links">
                        <K>uri</K>{' '}
                        <V>
                          at://did:plc:whme2bigebp52jl3456h464d/app.bsky.feed.post/3lrgja7t6uc24
                        </V>
                        ,
                      </L>
                      <L highlightOn="checksums">
                        <K>cid</K>{' '}
                        <V>
                          bafyreicjclx66vstawgvawlzrk5sdbjemxmhfheq7guvenfcf7h6kfope4
                        </V>
                      </L>
                    </O>
                  </O>
                  <L>
                    <K>langs</K> [<V>en</V>],
                  </L>
                  <O keyname="facets">
                    <L>
                      <K>index</K> {'{'} <K>byteEnd</K> <V number>12</V>,{' '}
                      <K>byteStart</K> <V number>0</V> {'}'},
                    </L>
                    <O keyname="features" array>
                      <O>
                        <L highlightOn="types">
                          <K>$type</K> <V>app.bsky.richtext.facet#link</V>
                        </L>
                        <L>
                          <K>uri</K> <V>https://bsky.storage</V>,
                        </L>
                      </O>
                    </O>
                  </O>
                </O>
              </JSON>
            </ExplainerUnitCanvas>
          </SyntaxHighlightContext.Provider>
        </NavContext.Provider>
        <ExplainerNav>
          <ExplainerNavItem
            id="json"
            title="It's just JSON"
            description="The AT Protocol is a data network. Posts, likes, follows, profiles, etc, are all just JSON."
            current={current}
            setCurrent={setCurrent}
          />
          <ExplainerNavItem
            id="types"
            title="Strongly typed"
            description="Compose records with type definitions based on JSON Schema."
            current={current}
            setCurrent={setCurrent}
          />
          <ExplainerNavItem
            id="links"
            title="Hyperlinked"
            description="Everything has a URL. Everyone posts from their own account. Everything is interlinked."
            current={current}
            setCurrent={setCurrent}
          />
          <ExplainerNavItem
            id="checksums"
            title="With checksums"
            description="Use content-IDs to create strong links to other users' data."
            current={current}
            setCurrent={setCurrent}
          />
          <ExplainerUnitCTA>LEARN MORE</ExplainerUnitCTA>
        </ExplainerNav>
      </div>
    </>
  )
}

function JSON({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="px-4 py-4 font-mono text-sm text-zinc-800 dark:text-zinc-400">
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
          'rounded-md border pl-1 transition-colors duration-300',
          selfIndent && 'pl-5 -indent-4',
          shouldHighlight
            ? 'border-yellow-600 bg-yellow-900/30'
            : 'border-transparent bg-transparent',
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
      <span className={clsx('font-medium')}>"{children}"</span>:
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
        'not-prose relative block w-2/3 overflow-scroll rounded-sm shadow-md shadow-zinc-900/5 ring-1 ring-zinc-900/20 dark:ring-zinc-100/15',
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

export function ExplainerNav({ children }: React.PropsWithChildren<{}>) {
  return <div className={clsx('flex-1')}>{children}</div>
}

export function ExplainerNavItem({
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
