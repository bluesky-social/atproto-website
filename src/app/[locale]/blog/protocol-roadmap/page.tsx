import { Page } from '@/components/Page'

export const metadata = {
  title: '2023 Protocol Roadmap',
  description: 'The current AT Protocol development plan through to a version one release.',
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
