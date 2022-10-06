import Link from 'next/link'
import {
  AcademicCapIcon,
  Bars3Icon,
  BookOpenIcon,
  CommandLineIcon,
  DocumentTextIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ContentGrid({ pages }) {
  const isOdd = pages.length % 2 === 1
  if (isOdd) {
    pages = pages.concat([{ empty: true, href: '#empty' }])
  }
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 border border-gray-200 sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
      {pages.map((page, pageIdx) => (
        <div
          key={page.href}
          className={classNames(
            pageIdx === 0
              ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none'
              : '',
            pageIdx === 1 ? 'sm:rounded-tr-lg' : '',
            pageIdx === pages.length - 2 ? 'sm:rounded-bl-lg' : '',
            pageIdx === pages.length - 1
              ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
              : '',
            'relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500'
          )}
        >
          {!page.empty && (
            <>
              <div>
                <span className="bg-blue-50 text-blue-700 rounded-lg inline-flex p-3 ring-4 ring-white">
                  {page.href.startsWith('/spec') && (
                    <DocumentTextIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                  {page.href.startsWith('/guides') && (
                    <AcademicCapIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                  {page.href.startsWith('/lexicons') && (
                    <BookOpenIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">
                  <Link href={page.href}>
                    <a href={page.href} className="focus:outline-none">
                      {/* Extend touch target to entire panel */}
                      <span className="absolute inset-0" aria-hidden="true" />
                      {page.name}
                    </a>
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">{page.description}</p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
