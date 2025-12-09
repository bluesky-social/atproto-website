import { Page } from '@/components/Page'

export const metadata = {
  title: 'Sync - AT Protocol Docs',
  description: 'Synchronizing and streaming data from the AT Protocol.',
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
