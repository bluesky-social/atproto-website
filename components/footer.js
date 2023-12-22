import DevMailingListSubscription from './mailing-list'
import Link from 'next/link'
import { BuildingOfficeIcon } from '@heroicons/react/24/solid'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons'
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
        <svg width="360" height="320" viewBox="0 0 360 320" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor">
          <path d="M254.896 184.158C252.81 183.926 250.733 183.645 248.671 183.315C250.773 183.574 252.849 183.855 254.896 184.158Z"/>
          <path d="M180 141.964C163.699 110.262 119.308 51.1817 78.0347 22.044C38.4971 -5.86834 23.414 -1.03207 13.526 3.43594C2.08093 8.60755 0 26.1785 0 36.5164C0 46.8542 5.66748 121.272 9.36416 133.694C21.5786 174.738 65.0603 188.607 105.104 184.156C107.151 183.852 109.227 183.572 111.329 183.312C109.267 183.642 107.19 183.924 105.104 184.156C46.4204 192.847 -5.69621 214.233 62.6582 290.33C137.848 368.18 165.705 273.637 180 225.702C194.295 273.637 210.76 364.771 295.995 290.33C360 225.702 313.58 192.85 254.896 184.158C252.81 183.926 250.733 183.645 248.671 183.315C250.773 183.574 252.849 183.855 254.896 184.158C294.94 188.61 338.421 174.74 350.636 133.697C354.333 121.275 360 46.8568 360 36.519C360 26.1811 357.919 8.61012 346.474 3.43851C336.586 -1.02949 321.503 -5.86576 281.965 22.0466C240.692 51.1843 196.301 110.262 180 141.964Z"/>
        </svg>
      ),
    }
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
