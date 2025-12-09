import { Page } from '@/components/Page'

export const metadata = {
  title: 'Labeler Subscriptions - AT Protocol Docs',
  description: 'Guide to moderation in AT Protocol.',
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
