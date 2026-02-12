import { Page } from '@/components/Page'

export const metadata = {
  title: 'Relay Updates for Sync v1.1',
  description: 'Updates to our reference implementation of the relay support sync version 1.1',
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
