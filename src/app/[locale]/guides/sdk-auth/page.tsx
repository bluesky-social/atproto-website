import { Page } from '@/components/Page'

export const metadata = {
  title: 'SDK auth - AT Protocol Docs',
  description: 'Auth for AT Protocol application developers.',
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
