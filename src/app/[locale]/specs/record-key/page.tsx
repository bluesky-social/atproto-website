import { Page } from '@/components/Page'

export const metadata = {
  title: 'Record Key',
  description: 'Identifier for individual records in a collection',
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
