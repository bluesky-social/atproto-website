'use client'

import { useEffect } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { stripLocalePrefix } from '@/components/Navigation'

// Next.js App Router skips its scroll-to-top reset when sibling pages share a
// layout and the new segment's element is judged "already visible" — most
// noticeable on /blog → /blog/<slug>, where users land on the post still
// scrolled down. Force a reset on every pathname change.
function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function ThemeWatcher() {
  let { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    let media = window.matchMedia('(prefers-color-scheme: dark)')

    function onMediaChange() {
      let systemTheme = media.matches ? 'dark' : 'light'
      if (resolvedTheme === systemTheme) {
        setTheme('system')
      }
    }

    onMediaChange()
    media.addEventListener('change', onMediaChange)

    return () => {
      media.removeEventListener('change', onMediaChange)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = stripLocalePrefix(pathname) === '/'

  return (
    <ThemeProvider
      attribute="class"
      disableTransitionOnChange
      forcedTheme={isHome ? 'dark' : undefined}
    >
      <ThemeWatcher />
      <ScrollToTop />
      {children}
    </ThemeProvider>
  )
}
