import Meta from '../../components/meta'
import Header from '../../components/header'
import Footer from '../../components/footer'
import Sidebar from '../../components/sidebar'
import Breadcrumbs from '../../components/breadcrumbs'
import Alert from '../../components/alert'
import CTA from '../../components/cta'
import { getNavigation, getFile } from '../../lib/content'

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
      <Meta title={file.title} description={file.summary} />
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-4">
        <Breadcrumbs pages={pages} />
      </div>
      <div className="flex max-w-4xl mx-auto">
        <Sidebar navigation={navigation} />
        <div className="flex-1 px-4 pb-16">
          {file.wip ? (
            <Alert
              title="Work in progress"
              message="This document is not complete. Please check back soon for updates."
            />
          ) : undefined}
          <div
            className="prose prose-pre:overflow-x-auto prose-pre:max-w-[90vw]"
            dangerouslySetInnerHTML={{ __html: file.bodyHTML }}
          ></div>
          {file.todo ? (
            <Alert
              title="Page not available"
              message="This document has not yet been written. Please check back soon for updates."
            />
          ) : undefined}
        </div>
      </div>
      <CTA />
      <Footer />
    </div>
  )
}
