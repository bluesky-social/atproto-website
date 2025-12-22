import { Page } from '@/components/Page'

export const metadata = {
  title: 'Glossary of terms',
  description:
    'A collection of terminology used in the AT Protocol and their definitions.',
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
