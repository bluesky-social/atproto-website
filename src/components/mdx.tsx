'use client'

import Link from 'next/link'
import NextImage, { ImageProps } from 'next/image'
import clsx from 'clsx'
import { createContext, useContext, useState, useId, useCallback } from 'react'

import { Heading } from '@/components/Heading'
import { Prose } from '@/components/Prose'

export function Image({ ...props }: ImageProps) {
  return <NextImage {...props} />
}

export const a = function ExternalAwareLink({
  href,
  ...props
}: React.ComponentPropsWithoutRef<'a'>) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://')

  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  }

  return <Link href={href ?? ''} {...props} />
}

export { Button } from '@/components/Button'
export { CodeGroup, Code as code, Pre as pre } from '@/components/Code'

export function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex h-full flex-col pb-24 pt-16">
      <Prose className="flex-auto">{children}</Prose>
      {/* <footer className="mx-auto mt-16 w-full max-w-2xl lg:max-w-5xl">
        <Feedback /> TODO
      </footer> */}
    </article>
  )
}

export const h2 = function H2(
  props: Omit<React.ComponentPropsWithoutRef<typeof Heading>, 'level'>,
) {
  return <Heading level={2} {...props} />
}

export const h3 = function H3(
  props: Omit<React.ComponentPropsWithoutRef<typeof Heading>, 'level'>,
) {
  return <Heading level={3} {...props} />
}

function InfoIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="8" strokeWidth="0" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6.75 7.75h1.5v3.5"
      />
      <circle cx="8" cy="4" r=".5" fill="none" />
    </svg>
  )
}

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-50/50 p-4 leading-6 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/5 dark:text-blue-200 dark:[--tw-prose-links-hover:theme(colors.blue.300)] dark:[--tw-prose-links:theme(colors.white)]">
      <InfoIcon className="mt-1 h-4 w-4 flex-none fill-blue-500 stroke-white dark:fill-blue-200/20 dark:stroke-blue-200" />
      <div className="[&>:first-child]:mt-0 [&>:last-child]:mb-0">
        {children}
      </div>
    </div>
  )
}

export function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 items-start gap-x-16 gap-y-10 xl:max-w-none xl:grid-cols-2">
      {children}
    </div>
  )
}

export function Col({
  children,
  sticky = false,
}: {
  children: React.ReactNode
  sticky?: boolean
}) {
  return (
    <div
      className={clsx(
        '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
        sticky && 'xl:sticky xl:top-24',
      )}
    >
      {children}
    </div>
  )
}

export function Properties({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6">
      <ul
        role="list"
        className="m-0 max-w-[calc(theme(maxWidth.lg)-theme(spacing.8))] list-none divide-y divide-zinc-900/5 p-0 dark:divide-white/5"
      >
        {children}
      </ul>
    </div>
  )
}

export function Property({
  name,
  children,
  type,
}: {
  name: string
  children: React.ReactNode
  type?: string
}) {
  return (
    <li className="m-0 px-0 py-4 first:pt-0 last:pb-0">
      <dl className="m-0 flex flex-wrap items-center gap-x-3 gap-y-2">
        <dt className="sr-only">Name</dt>
        <dd>
          <code>{name}</code>
        </dd>
        {type && (
          <>
            <dt className="sr-only">Type</dt>
            <dd className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
              {type}
            </dd>
          </>
        )}
        <dt className="sr-only">Description</dt>
        <dd className="w-full flex-none [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </dd>
      </dl>
    </li>
  )
}

type SyncedTabsContextType = {
  selectedValue: string | null
  setSelectedValue: (value: string) => void
}

const SyncedTabsContext = createContext<SyncedTabsContextType | null>(null)

export function SyncedTabs({ children }: { children: React.ReactNode }) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null)

  return (
    <SyncedTabsContext.Provider value={{ selectedValue, setSelectedValue }}>
      {children}
    </SyncedTabsContext.Provider>
  )
}

// Individual TabGroup context
type TabGroupContextType = {
  selectedValue: string
  setSelectedValue: (value: string) => void
  groupId: string
}

const TabGroupContext = createContext<TabGroupContextType | null>(null)

function useTabGroup() {
  const context = useContext(TabGroupContext)
  if (!context) {
    throw new Error('Tab components must be used within a TabGroup')
  }
  return context
}

export function TabGroup({
  children,
  defaultValue,
}: {
  children: React.ReactNode
  defaultValue?: string
}) {
  const groupId = useId()
  const syncedContext = useContext(SyncedTabsContext)
  const [localValue, setLocalValue] = useState(defaultValue ?? '')

  // Use synced value if this TabGroup has a tab matching it, otherwise use local
  const selectedValue = syncedContext?.selectedValue ?? localValue

  const setSelectedValue = (value: string) => {
    setLocalValue(value)
    syncedContext?.setSelectedValue(value)
  }

  return (
    <TabGroupContext.Provider value={{ selectedValue, setSelectedValue, groupId }}>
      <div className="my-6">{children}</div>
    </TabGroupContext.Provider>
  )
}

export function TabList({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="tablist"
      className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
    >
      {children}
    </div>
  )
}

export function Tab({
  children,
  value,
}: {
  children: React.ReactNode
  value: string
}) {
  const { selectedValue, setSelectedValue, groupId } = useTabGroup()
  const isSelected = selectedValue === value

  return (
    <button
      role="tab"
      id={`tab-${groupId}-${value}`}
      aria-selected={isSelected}
      aria-controls={`tabpanel-${groupId}-${value}`}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => setSelectedValue(value)}
      className={clsx(
        'px-4 py-2 text-sm font-medium transition-colors',
        '-mb-px border-b-2',
        isSelected
          ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
          : 'border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
      )}
    >
      {children}
    </button>
  )
}

export function TabPanels({ children }: { children: React.ReactNode }) {
  return <div className="mt-4">{children}</div>
}

export function TabPanel({
  children,
  value,
}: {
  children: React.ReactNode
  value: string
}) {
  const { selectedValue, groupId } = useTabGroup()
  const isSelected = selectedValue === value

  if (!isSelected) return null

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${groupId}-${value}`}
      aria-labelledby={`tab-${groupId}-${value}`}
      className="[&>:first-child]:mt-0 [&>:last-child]:mb-0"
    >
      {children}
    </div>
  )
}