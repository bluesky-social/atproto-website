import Meta from '../components/meta'
import Link from 'next/link'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Header from '../components/header'
import Footer from '../components/footer'
import Breadcrumbs from '../components/breadcrumbs'
import { getNavigationWithDesc } from '../lib/content'

export async function getStaticProps(context) {
  const navigation = await getNavigationWithDesc()
  return { props: { navigation } }
}

export default function Docs({ navigation }) {
  const pages = [{ name: 'Docs', href: '/docs', current: true }]
  const firstPage = navigation.guides[0]
  return (
    <div>
      <Meta title="Docs" />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-4 sticky lg:relative top-0 bg-white z-10">
        <Breadcrumbs pages={pages} />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl mb-2 font-normal">Guides</h2>
        <div className="relative flex px-6 py-6 border border-gray-300 rounded-xl mb-4 hover:border-blue-500 focus-within:border-blue-500">
          <div className="mr-4 hidden sm:block">
            <span className="bg-blue-500 text-white rounded-lg inline-flex p-2 sm:p-3 ring-4 ring-white">
              <AcademicCapIcon
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
                  <span className="bg-blue-100 text-blue-700 font-mono text-xs px-1.5 pt-0.5 pb-0.5 rounded-md -top-0.5 relative">
                    Start&nbsp;here
                  </span>
                </a>
              </Link>
            </h3>
            <p className="text-md">{firstPage.description}</p>
          </div>
        </div>
        <Links pages={navigation.guides.slice(1)} />

        <h2 className="text-3xl mb-2 font-normal">Specs</h2>
        <Links pages={navigation.specs} />

        <h2 className="text-3xl mb-2 font-normal">Lexicons</h2>
        <Links pages={navigation.lexicons} />
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
