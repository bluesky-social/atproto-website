import { Page } from '@/components/Page'

export const metadata = {
  title: 'Relay Operational Updates',
  description: 'Updates on changes to Bluesky relay servers and guidance for firehose consumers.',
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
