import Meta from '../components/meta'
import Link from 'next/link'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import Header from '../components/header'
import Footer from '../components/footer'
import Breadcrumbs from '../components/breadcrumbs'
import ContentGrid from '../components/content-grid'
import { getNavigationWithDesc } from '../lib/content'

export async function getStaticProps(context) {
  const navigation = await getNavigationWithDesc('guides', '/guides')
  return { props: { navigation } }
}

export default function Guides({ navigation }) {
  const pages = [{ name: 'Guides', href: '/guides', current: true }]
  const firstPage = navigation[0]
  return (
    <div>
      <Meta title="Guides" />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Breadcrumbs pages={pages} />
      </div>
      <div className="flex max-w-4xl mx-auto">
        <div className="flex-1 px-4">
          <div class="relative flex px-6 py-6 border border-gray-200 rounded-lg mb-6">
            <div>
              <span className="bg-blue-500 text-white rounded-lg inline-flex p-3 ring-4 ring-white">
                <AcademicCapIcon className="h-10 w-10" aria-hidden="true" />
              </span>
            </div>
            <div className="ml-4 pt-1.5">
              <h3 className="text-2xl font-bold leading-6 mb-1">
                <Link href={firstPage.href}>
                  <a href={firstPage.href} className="focus:outline-none">
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

          <ContentGrid pages={navigation.slice(1)} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
