import { Fragment } from 'react'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  DocumentTextIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faTwitter } from '@fortawesome/free-brands-svg-icons'
import { faSquare } from '@fortawesome/free-solid-svg-icons'



const SiteSections = [
  {
    name: 'Documentation',
    href: '/docs',
    icon: DocumentTextIcon,
  },
  {
    name: 'Community',
    href: '/community',
    icon: ChatBubbleLeftRightIcon
  },
  {
    name: 'Developer Blog',
    href: '/blog',
    icon: PencilIcon
  }
]

const ExternalLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/bluesky',
    icon: ({ className }) => (
      <FontAwesomeIcon icon={faTwitter} className={className} />
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/bluesky-social',
    icon: ({ className }) => (
      <FontAwesomeIcon icon={faGithub} className={className} />
    ),
  },
  {
    name: 'Bluesky Social',
    href: 'https://bsky.app/profile/bsky.app',
    icon: ({ className }) => (
      <FontAwesomeIcon icon={faSquare} className={className} />
    ),
  }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

/*
{SiteSections.map((item) => (
  <Link key={item.href} href={item.href}>
    <a
      title={item.name}
      className="text-base font-medium text-gray-500 hover:text-gray-900"
    >
      {item.name}
    </a>
  </Link>
))}*/

export default function Header() {
  return (
    <Popover className="relative z-[20] bg-white">
      <header>
      <div className="flex items-center justify-between border-b-2 border-gray-100 px-4 sm:px-6 py-4 sm:py-6 md:justify-start md:space-x-10">
        <div className="flex justify-start">
          <Link href="/">
            <a>
              <img className="h-10 w-auto" src="/logo.jpg" alt="The AT Protocol homepage" />
            </a>
          </Link>
        </div>
        <div className="-my-2 -mr-2 md:hidden">
          <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
            <span className="sr-only">Open menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </Popover.Button>
        </div>
        <nav aria-label="AT Protocol" className="hidden space-x-10 md:flex">
          {SiteSections.map((item, i) => (
            <Link key={item.href} href={item.href}>
              <a
                title={item.name}
                className="text-base font-medium text-gray-500 hover:text-gray-900"
              >
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
        <nav aria-label="External links" className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
          {ExternalLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <a title={item.name} className="ml-6">
                <item.icon className="h-6 w-6" />
              </a>
            </Link>
          ))}
        </nav>
      </div>

      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Panel
          focus
          className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden"
        >
          <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-5 pt-5 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <img className="h-8 w-auto" src="/logo.jpg" alt="ATP" />
                </div>
                <div className="-mr-2">
                  <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {SiteSections.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50">
                        <item.icon
                          className="h-6 w-6 flex-shrink-0 text-blue-600"
                          aria-hidden="true"
                        />
                        <span className="ml-3 text-base font-medium text-gray-900">
                          {item.name}
                        </span>
                      </a>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <div className="space-y-6 pt-5 pb-6 px-5">
              <div className="flex items-center">
                {ExternalLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a title={item.name} className="mr-6 block">
                      <item.icon className="h-8 w-8" />
                    </a>
                  </Link>
                ))}
                <Link href="https://bsky.app">
                  <a className="ml-auto block bg-blue-500 text-white px-6 py-1 rounded-md leading-8">
                    Join the waitlist
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
      </header>
    </Popover>
  )
}
