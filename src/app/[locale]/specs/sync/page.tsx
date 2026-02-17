import { Page } from '@/components/Page'

export const metadata = {
  title: 'Sync',
  description: 'Firehose and other data synchronization mechanisms.',
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
