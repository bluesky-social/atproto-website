import { Page } from '@/components/Page'

export const metadata = {
  title: 'Understanding ATProto - AT Protocol Docs',
  description: 'Dive deeper into the concepts behind the AT Protocol.',
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
