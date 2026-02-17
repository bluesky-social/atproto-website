import { Page } from '@/components/Page'

export const metadata = {
  title: 'Self-hosting - AT Protocol Docs',
  description:
    'Self-hosting components of the AT Protocol Stack.',
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
