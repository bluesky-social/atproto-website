'use client'

import { motion } from 'framer-motion'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Navigation } from '@/components/Navigation'
import { SectionProvider } from './SectionProvider'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SectionProvider sections={[]} /* fallback to be overridden */>
      <div className="h-full lg:ml-72 xl:ml-80">
        <motion.header
          layoutScroll
          className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:top-14 lg:z-40 lg:flex"
        >
          <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-5 lg:pb-8 lg:pt-4 xl:w-72 lg:dark:border-white/10">
            <Header />
            <Navigation className="hidden lg:block" />
          </div>
        </motion.header>
        <div className="relative flex h-full flex-col pt-14">
          <main className="flex-auto">{children}</main>
          <Footer />
        </div>
      </div>
    </SectionProvider>
  )
}
