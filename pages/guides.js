import Head from 'next/head'
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
  return (
    <div>
      <Head>
        <title>Guides | at:// protocol</title>
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
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <Breadcrumbs pages={pages} />
      </div>
      <div className="flex max-w-4xl mx-auto">
        <div className="flex-1 px-4">
          <h1 className="text-center text-4xl font-bold pb-6">Guides</h1>
          <ContentGrid
            pages={navigation.filter((page) => page.href !== '/guides')}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
