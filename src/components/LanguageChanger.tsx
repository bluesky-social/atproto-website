'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useCurrentLocale } from 'next-i18n-router/client'
import i18nConfig from '../../i18nConfig'
import { ChangeEvent } from 'react'

export default function LanguageChanger() {
  const currentLocale = useCurrentLocale(i18nConfig)
  const router = useRouter()
  const currentPathname = usePathname()

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value

    // set cookie for next-i18n-router
    const days = 30
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`

    // redirect to the new locale path
    if (currentLocale === i18nConfig.defaultLocale) {
      router.push('/' + newLocale + currentPathname)
    } else {
      router.push(currentPathname.replace(`/${currentLocale}`, `/${newLocale}`))
    }

    router.refresh()
  }

  return (
    <select
      onChange={handleChange}
      value={currentLocale}
      className="block w-full appearance-none rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700"
    >
      <option value="en">English</option>
      <option value="pt">Português</option>
    </select>
  )
}
