import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
import Sidebar from '../components/sidebar'
import Breadcrumbs from '../components/breadcrumbs'
import ContentGrid from '../components/content-grid'
import { getNavigationWithDesc } from '../lib/content'

export async function getStaticProps(context) {
  const navigation = await getNavigationWithDesc('lexicons', '/lexicons')
  return { props: { navigation } }
}

export default function Lexicons({ navigation }) {
  const pages = [{ name: 'Lexicons', href: '/lexicons', current: true }]
  return (
    <div>
      <Head>
        <title>Lexicons | at:// protocol</title>
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
      <div className="flex max-w-4xl mx-auto pt-4">
        <Sidebar navigation={navigation} />
        <div className="flex-1 px-4 pt-4">
          <div className="pb-5">
            <Breadcrumbs pages={pages} />
          </div>
          <ContentGrid
            pages={navigation.filter((page) => page.href !== '/lexicons')}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
