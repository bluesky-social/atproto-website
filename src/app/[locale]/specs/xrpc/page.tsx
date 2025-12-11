import { Page } from '@/components/Page'

export const metadata = {
  title: 'HTTP API (XRPC)',
  description: 'Cross-system queries and procedures over HTTP',
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
