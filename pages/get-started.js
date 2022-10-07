import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
import Sidebar from '../components/sidebar'
import Breadcrumbs from '../components/breadcrumbs'
import ContentGrid from '../components/content-grid'

// export async function getStaticProps(context) {
//   const navigation = await getNavigationWithDesc('Get Started', '/Get Started')
//   return { props: { navigation } }
// }
const navigation = [
  { name: 'Get Started', href: '/get-started', current: true },
  { name: 'TODO', href: '#', current: false },
]

export default function GetStarted({}) {
  const pages = [{ name: 'Get Started', href: '/get-started', current: true }]
  return (
    <div>
      <Head>
        <title>Get Started | at:// protocol</title>
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
        <div className="flex-1 px-4">TODO</div>
      </div>
      <Footer />
    </div>
  )
}
