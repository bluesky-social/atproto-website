import Link from 'next/link'
import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ContentGrid({ pages }) {
  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 border border-gray-200">
      {pages.map((page, pageIdx) => (
        <div
          key={page.href}
          className={classNames(
            pageIdx === 0
              ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none'
              : '',
            pageIdx === pages.length - 1
              ? 'rounded-bl-lg rounded-br-lg sm:rounded-bl-none'
              : '',
            'relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500'
          )}
        >
          {!page.empty && (
            <div class="flex">
              <div>
                <span className="bg-blue-500 text-white rounded-lg inline-flex p-3 ring-4 ring-white">
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
              <div className="ml-4">
                <h3 className="text-xl font-semibold leading-6">
                  <Link href={page.href}>
                    <a href={page.href} className="focus:outline-none">
                      {/* Extend touch target to entire panel */}
                      <span className="absolute inset-0" aria-hidden="true" />
                      {page.name}
                    </a>
                  </Link>
                </h3>
                <p className="text-md text-gray-500">{page.description}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
