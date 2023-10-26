import DevMailingListSubscription from './mailing-list'
import Link from 'next/link'
import { BuildingOfficeIcon } from '@heroicons/react/24/solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons'
import { faSquare, faComments } from '@fortawesome/free-solid-svg-icons'

const navigation = {
  main: [],
  social: [
    {
      name: 'Bluesky Website',
      href: 'https://blueskyweb.xyz',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/bluesky',
      icon: ({ className }) => (
        <FontAwesomeIcon icon={faXTwitter} className={className} />
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
      name: 'Discuss',
      href: 'https://github.com/bluesky-social/atproto/discussions',
      icon: ({ className }) => (
        <FontAwesomeIcon icon={faComments} className={className} />
      ),
    },
    {
      name: 'Bluesky Social',
      href: 'https://bsky.app/profile/atproto.com',
      icon: ({ className }) => (
        <FontAwesomeIcon icon={faSquare} className={className} />
      ),
    },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <DevMailingListSubscription isFooter={true}/>
        <nav
          className="-mx-5 -my-2 flex flex-wrap justify-center"
          aria-label="Bluesky website"
        >
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <Link href={item.href}>
                <a className="text-base text-gray-500 hover:text-gray-900">
                  {item.name}
                </a>
              </Link>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          {navigation.social.map((item) => (
            <Link key={item.name} href={item.href}>
              <a className="text-gray-500 hover:text-gray-600">
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-gray-500">
          &copy; {new Date().getFullYear()} Bluesky, PBC. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
