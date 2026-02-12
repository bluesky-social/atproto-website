import { Page } from '@/components/Page'

export const metadata = {
  title: 'Bluesky BGS and DID Document Formatting Changes',
  description: 'Protocol and infrastructure changes including the BGS firehose and DID document formatting updates.',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
