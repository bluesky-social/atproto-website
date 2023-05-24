import Meta from '../components/meta'
import Link from 'next/link'
import { BookOpenIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Header from '../components/header'
import Footer from '../components/footer'
import Breadcrumbs from '../components/breadcrumbs'
import { getNavigationWithDesc } from '../lib/content'

export async function getStaticProps(context) {
  const navigation = await getNavigationWithDesc()
  return { props: { navigation } }
}

export default function Community({ navigation }) {
  const pages = [{ name: 'Community', href: '/community', current: true }]
  const firstPage = navigation.community[0]
  return (
    <div>
      <Meta title="Community" />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-4 sticky lg:relative top-0 bg-white z-10">
        <Breadcrumbs pages={pages} />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative flex px-6 py-6 border border-gray-300 rounded-xl mb-4 hover:border-blue-500 focus-within:border-blue-500">
          <div className="mr-4 hidden sm:block">
            <span className="bg-blue-500 text-white rounded-lg inline-flex p-2 sm:p-3 ring-4 ring-white">
              <BookOpenIcon
                className="h-8 sm:h-10 w-8 sm:w-10"
                aria-hidden="true"
              />
            </span>
          </div>
          <div className="pt-1.5">
            <h3 className="text-2xl font-bold leading-6 mb-1">
              <Link href={firstPage.href}>
                <a className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {firstPage.name}{' '}
  
                </a>
              </Link>
            </h3>
            <p className="text-md">{firstPage.description}</p>
          </div>
        </div>
        <Links pages={navigation.community.slice(1)} />

      </div>
      <Footer />
    </div>
  )
}



function Links({ pages }) {
  return (
    <div className="mb-8">
      {pages.map((page, pageIdx) => (
        <div
          key={page.href}
          className="relative flex items-center px-6 py-6 border border-gray-300 rounded-xl mb-4 hover:border-blue-500 focus-within:border-blue-500"
        >
          <div className="flex-1">
            <h3 className="text-xl leading-6 font-light">
              <Link href={page.href}>
                <a className="focus:outline-none">
                  {/* Extend touch target to entire panel */}
                  <span className="absolute inset-0" aria-hidden="true" />
                  {page.name}
                </a>
              </Link>
            </h3>
            <p className="text-md text-gray-500 font-light">
              {page.description}
            </p>
          </div>
          <ChevronRightIcon
            className="h-8 sm:h-10 w-8 sm:w-10"
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  )
}
