'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Navigation } from '@/components/Navigation'
import { SectionProvider } from './SectionProvider'
import { SyncedTabs } from '@/components/mdx'

const localeHomePaths = ['/', '/pt', '/ja', '/ko']

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = localeHomePaths.includes(pathname)

  return (
    <SectionProvider sections={[]} /* fallback to be overridden */>
      <div className={clsx('h-full', !isHome && 'lg:ml-72 xl:ml-72')}>
        <motion.header
          layoutScroll
          className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:top-14 lg:z-40 lg:flex"
        >
          <div
            className={clsx(
              'contents lg:pointer-events-auto lg:block',
              !isHome &&
                'lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-5 lg:pb-8 lg:pt-4 xl:w-72 lg:dark:border-white/10',
            )}
          >
            <Header minimal={isHome} />
            {!isHome && <Navigation className="hidden lg:block" />}
          </div>
        </motion.header>
        <div className="relative flex h-full flex-col pt-14">
          <main className="flex-auto">
            <SyncedTabs>{children}</SyncedTabs>
          </main>
          <Footer minimal={isHome} />
        </div>
      </div>
    </SectionProvider>
  )
}
