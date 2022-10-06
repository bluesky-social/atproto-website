import Head from 'next/head'
import Header from '../../components/header'
import Footer from '../../components/footer'
import Sidebar from '../../components/sidebar'
import Breadcrumbs from '../../components/breadcrumbs'
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
  const pages = [
    { name: 'Specs', href: '/specs', current: false },
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
      <div className="flex max-w-4xl mx-auto pt-4">
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
