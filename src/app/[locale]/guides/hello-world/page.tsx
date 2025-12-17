import { Page } from '@/components/Page'

export const metadata = {
  title: 'Hello World with the AT Protocol',
  description:
    'Get started with AT Protocol in under two minutes using the TypeScript SDK.',
}

export default async function HelloWorldPage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
