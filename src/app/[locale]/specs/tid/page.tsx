import { Page } from '@/components/Page'

export const metadata = {
  title: 'Timestamp Identifiers (TIDs)',
  description:
    'A compact timestamp-based identifier for revisions and records.',
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
