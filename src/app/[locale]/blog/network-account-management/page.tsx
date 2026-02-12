import { Page } from '@/components/Page'

export const metadata = {
  title: 'Network Account Management',
  description: 'We recently shipped new functionality to the PDS reference implementation (and Bluesky\'s hosting service) which provides a web interface to create and manage accounts directly on the PDS itself.',
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
