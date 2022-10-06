import Head from 'next/head'
import Header from '../../components/header'
import Footer from '../../components/footer'
import PreviewWarning from '../../components/preview-warning'
import Sidebar from '../../components/sidebar'
import { getNavigation, getFile } from '../../lib/content'
// import styles from '../../styles/Markdown.module.css'

export async function getStaticPaths() {
  const navigation = await getNavigation('specs', '/specs')
  return {
    paths: navigation
      .map((item) => {
        return {
          params: { id: item.href.slice('/specs/'.length) },
        }
      })
      .filter((item) => item.params.id.length > 0),
    fallback: false,
  }
}

export async function getStaticProps(context) {
  const navigation = await getNavigation('specs', `/specs/${context.params.id}`)
  const file = await getFile('specs', context.params.id)
  return { props: { navigation, file } }
}

export default function Spec({ navigation, file }) {
  return (
    <div>
      <Head>
        <title>{file.title + ' | at:// protocol'}</title>
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
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: file.bodyHTML }}
          ></div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
