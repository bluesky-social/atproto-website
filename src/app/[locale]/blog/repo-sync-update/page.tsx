import { Page } from '@/components/Page'

export const metadata = {
  title: 'Updates to Repository Sync Semantics',
  description: 'Announcing updates to atproto repositories that remove history and replace it with a logical clock.',
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
