import { Page } from '@/components/Page'

export const metadata = {
  title: 'Lexicons - AT Protocol Docs',
  description: 'A schema-driven interoperability framework',
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
