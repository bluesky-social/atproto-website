import { Page } from '@/components/Page'

export const metadata = {
  title: 'Bluesky Call for Developers',
  description: 'Bluesky is an open social network built on the AT Protocol. If you\'re a developer interested in building on atproto, we\'d love to hear from you.',
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
