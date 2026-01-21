import { Page } from '@/components/Page'

export const metadata = {
  title: 'Welcome to the AT Protocol Blog',
  description: 'Introducing the official AT Protocol blog where we share updates, tutorials, and insights about building on the decentralized social web.',
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
