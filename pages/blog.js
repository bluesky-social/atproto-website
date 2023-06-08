import Meta from '../components/meta'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import Header from '../components/header'
import Footer from '../components/footer'
import Breadcrumbs from '../components/breadcrumbs'
import { getNavigationWithDesc } from '../lib/content'

export async function getStaticProps(context) {
  const navigation = await getNavigationWithDesc()
  return { props: { navigation } }
}

export default function Blog({ navigation }) {
  const pages = [{ name: 'Dev Blog', href: '/blog', current: true }]
  const firstPage = navigation.blog[0]
  return (
    <div>
      <Meta title="Dev Blog" />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-4 sticky lg:relative top-0 bg-white z-10">
        <Breadcrumbs pages={pages} />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <Links pages={navigation.blog} />
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
              {page.date}
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
