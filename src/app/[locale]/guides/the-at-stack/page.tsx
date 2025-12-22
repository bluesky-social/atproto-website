import { Page } from '@/components/Page'

export const metadata = {
  title: 'The AT Stack - AT Protocol Docs',
  description:
    'Components of the AT Protocol Stack.',
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
