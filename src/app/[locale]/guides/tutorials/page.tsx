import { Page } from '@/components/Page'

export const metadata = {
  title: 'Tutorials - AT Protocol Docs',
  description: 'AT Protocol Tutorials',
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
