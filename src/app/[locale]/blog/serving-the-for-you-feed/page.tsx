import { Page } from '@/components/Page'

export const metadata = {
  title: 'Serving the For You Feed',
  description: 'How the maintainer of the popular For You feed serves it from their living room!',
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
