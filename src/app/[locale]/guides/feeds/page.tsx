import { Page } from '@/components/Page'

export const metadata = {
  title: 'Feeds - AT Protocol Docs',
  description: 'Creating and consuming custom feed generators',
}

export default async function HomePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
