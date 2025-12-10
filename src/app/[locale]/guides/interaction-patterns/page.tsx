import { Page } from '@/components/Page'

export const metadata = {
  title: 'Interaction Patterns - AT Protocol Docs',
  description: 'Read and Write AT Protocol Records.',
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
