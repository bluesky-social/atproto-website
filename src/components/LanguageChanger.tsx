'use client'

import { useRouter, usePathname } from 'next/navigation'
import i18nConfig from '../../i18nConfig'
import { ChangeEvent } from 'react'

const { locales, defaultLocale } = i18nConfig

// Derive the locale from the URL rather than the NEXT_LOCALE cookie.
//
// next-i18n-router's `useCurrentLocale` reads the cookie *before* the
// pathname, so once the cookie is set it can disagree with the page you're
// actually on. Switching locale off of the cookie value then rewrites the
// wrong path prefix, which is what made a /ja selection on the homepage
// "stick" and keep redirecting other pages back to /ja. The URL is the only
// reliable source of truth for which locale a page is rendering.
function localeFromPathname(pathname: string): string {
  return (
    locales.find(
      (locale) =>
        pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    ) ?? defaultLocale
  )
}

export default function LanguageChanger() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = localeFromPathname(pathname)

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value
    if (newLocale === currentLocale) return

    // set cookie for next-i18n-router (drives middleware redirects on
    // unprefixed/default-locale paths)
    const days = 30
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`

    // Strip the current locale prefix to get the locale-agnostic base path...
    const basePath =
      currentLocale === defaultLocale
        ? pathname
        : pathname.replace(`/${currentLocale}`, '') || '/'

    // ...then re-prefix only for non-default locales. The default locale is
    // served unprefixed, so building the canonical path directly (e.g. `/docs`
    // rather than `/en/docs`) avoids forcing the middleware into a redirect
    // mid-navigation, which is what made the soft push misbehave before.
    const target =
      newLocale === defaultLocale
        ? basePath
        : `/${newLocale}${basePath === '/' ? '' : basePath}`

    router.push(target)
    // Invalidate the client router cache so prefetched links don't replay a
    // locale redirect that was cached under the previous cookie value.
    router.refresh()
  }

  return (
    <select
      aria-label="Language"
      onChange={handleChange}
      value={currentLocale}
      className="block w-full appearance-none rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700"
    >
      <option value="en">English</option>
      <option value="pt">Português</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
    </select>
  )
}
