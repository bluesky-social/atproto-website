import Head from 'next/head'
import Header from '../components/header'
import Footer from '../components/footer'
import PreviewWarning from '../components/preview-warning'
import Sidebar from '../components/sidebar'
import { getNavigation } from '../lib/content'

export async function getStaticProps(context) {
  const navigation = await getNavigation('specs', '/specs')
  return { props: { navigation } }
}

export default function Specs({ navigation }) {
  return (
    <div>
      <Head>
        <title>Specifications | at:// protocol</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
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
