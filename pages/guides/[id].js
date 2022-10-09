import Head from 'next/head'
import Header from '../../components/header'
import Footer from '../../components/footer'
import Sidebar from '../../components/sidebar'
import Breadcrumbs from '../../components/breadcrumbs'
import Alert from '../../components/alert'
import CTA from '../../components/cta'
import { getNavigation, getFile } from '../../lib/content'

export async function getStaticPaths() {
  const navigation = await getNavigation('guides', '/guides')
  return {
    paths: navigation
      .map((item) => {
        return {
          params: { id: item.href.slice('/guides/'.length) },
        }
      })
      .filter((item) => item.params.id.length > 0),
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const navigation = await getNavigation(
    'guides',
    `/guides/${context.params.id}`
  )
  const file = await getFile('guides', context.params.id)
  return { props: { navigation, file } }
}

export default function Guide({ navigation, file }) {
  const pages = [
    { name: 'Guides', href: '/guides', current: false },
    { name: file.title, href: file.path, current: true },
  ]
  return (
    <div>
      <Head>
        <title>{file.title + ' | at:// protocol'}</title>
        <meta name="description" content="" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Breadcrumbs pages={pages} />
      </div>
      <div className="flex max-w-4xl mx-auto">
        <Sidebar navigation={navigation} />
        <div className="flex-1 px-4 pb-16">
          <div
            className="prose prose-pre:overflow-x-auto prose-pre:max-w-[90vw]"
            dangerouslySetInnerHTML={{ __html: file.bodyHTML }}
          ></div>
          {file.todo ? (
            <div className="py-6">
              <Alert
                title="Page not available"
                message="This document has not yet been written. Please check back soon for updates."
              />
            </div>
          ) : undefined}
        </div>
      </div>
      <CTA />
      <Footer />
    </div>
  )
}
