import Head from 'next/head'
import Header from '../../components/header'
import Footer from '../../components/footer'
import PreviewWarning from '../../components/preview-warning'
import Sidebar from '../../components/sidebar'
import Breadcrumbs from '../../components/breadcrumbs'
import { getNavigation, getFile } from '../../lib/content'
// import styles from '../../styles/Markdown.module.css'

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
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="max-w-4xl mx-auto my-4 px-4 lg:px-0">
        <PreviewWarning rounded />
      </div>
      <div className="flex max-w-4xl mx-auto">
        <Sidebar navigation={navigation} />
        <div className="flex-1 px-4 pt-4">
          <div className="pb-4">
            <Breadcrumbs pages={pages} />
          </div>
          <div
            className="prose prose-pre:overflow-x-auto prose-pre:max-w-[90vw]"
            dangerouslySetInnerHTML={{ __html: file.bodyHTML }}
          ></div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
