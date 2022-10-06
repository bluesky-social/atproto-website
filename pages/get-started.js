import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
import PreviewWarning from '../components/preview-warning'
import Sidebar from '../components/sidebar'

const navigation = [
  { name: 'Overview', href: '/get-started', current: true },
  { name: 'TODO', href: '#', current: false },
]

export default function GetStarted() {
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
      <div className="flex border-b border-gray-100">
        <Sidebar navigation={navigation} />
        <div className="flex-1 px-4 py-4">
          <div className="mb-4">
            <PreviewWarning rounded />
          </div>
          TODO
        </div>
      </div>
      <Footer />
    </div>
  )
}
