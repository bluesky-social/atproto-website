import { Page } from '@/components/Page'

export const metadata = {
  title: 'OAuth for AT Protocol',
  description: 'Releasing the initial specification of OAuth for AT Protocol, the primary authentication and authorization system going forward.',
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
