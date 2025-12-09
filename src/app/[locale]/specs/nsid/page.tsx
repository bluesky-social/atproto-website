import { Page } from '@/components/Page'

export const metadata = {
  title: 'Namespaced Identifiers (NSIDs)',
  description: 'A specification for global semantic IDs.',
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
