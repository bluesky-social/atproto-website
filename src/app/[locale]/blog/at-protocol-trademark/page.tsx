import { Page } from '@/components/Page'

export const metadata = {
  title: 'AT Protocol Trademark',
  description: 'Bluesky now owns the AT Protocol trademark to help make sure it can be used as widely and responsibly as possible.',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(`./${(await params).locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
