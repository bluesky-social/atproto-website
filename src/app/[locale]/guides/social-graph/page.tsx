import { Page } from '@/components/Page'

export const metadata = {
  title: 'Social Graph - AT Protocol Docs',
  description: 'Working with AT Protocol Social Graphs',
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
