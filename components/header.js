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
import { faSquare, faComments } from '@fortawesome/free-solid-svg-icons'
import { DocSearch } from '@docsearch/react';
import '@docsearch/css';


const SiteSections = [
  {
    name: 'Documentation',
    href: '/docs',
    icon: DocumentTextIcon,
  },
  {
    name: 'Bluesky API',
    href: 'https://docs.bsky.app/',
    icon: DocumentTextIcon,
  }
]

const ExternalLinks = [
  {
    name: 'Bluesky Social',
    href: 'https://bsky.app/profile/atproto.com',
    icon: ({ className }) => (
      <svg width="360" height="320" viewBox="0 0 360 320" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
        <path d="M254.896 184.158C252.81 183.926 250.733 183.645 248.671 183.315C250.773 183.574 252.849 183.855 254.896 184.158Z"/>
        <path d="M180 141.964C163.699 110.262 119.308 51.1817 78.0347 22.044C38.4971 -5.86834 23.414 -1.03207 13.526 3.43594C2.08093 8.60755 0 26.1785 0 36.5164C0 46.8542 5.66748 121.272 9.36416 133.694C21.5786 174.738 65.0603 188.607 105.104 184.156C107.151 183.852 109.227 183.572 111.329 183.312C109.267 183.642 107.19 183.924 105.104 184.156C46.4204 192.847 -5.69621 214.233 62.6582 290.33C137.848 368.18 165.705 273.637 180 225.702C194.295 273.637 210.76 364.771 295.995 290.33C360 225.702 313.58 192.85 254.896 184.158C252.81 183.926 250.733 183.645 248.671 183.315C250.773 183.574 252.849 183.855 254.896 184.158C294.94 188.61 338.421 174.74 350.636 133.697C354.333 121.275 360 46.8568 360 36.519C360 26.1811 357.919 8.61012 346.474 3.43851C336.586 -1.02949 321.503 -5.86576 281.965 22.0466C240.692 51.1843 196.301 110.262 180 141.964Z"/>
      </svg>
    ),
  },
  {
    name: 'Discuss',
    href: 'https://github.com/bluesky-social/atproto/discussions',
    icon: ({ className }) => (
      <FontAwesomeIcon icon={faComments} className={className} />
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/bluesky-social',
    icon: ({ className }) => (
      <FontAwesomeIcon icon={faGithub} className={className} />
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
      <div className="flex items-center">
      <nav aria-label="Search bar" className="flex justify-start">
          <DocSearch className="justify-start"
                  appId="Y5AKKROMIR"
                  indexName="atproto-web"
                  // public search key that can safely be used in front end code
                  // used for search queries & listing indices
                  apiKey="9b7e0221b5cfa0c83f10de66e365c511"
          />
      </nav>
      <div className="-my-2 -mr-2 md:hidden">
          <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </Popover.Button>
      </div>
    </div>

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
