import { Page } from '@/components/Page'

export const metadata = {
  title: 'Login with Atmosphere - AT Protocol Docs',
  description: 'Embedding an Atmosphere login widget into your app',
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
