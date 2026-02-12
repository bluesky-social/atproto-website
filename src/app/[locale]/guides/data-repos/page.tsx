import { Page } from '@/components/Page'

export const metadata = {
  title: 'Personal Data Repositories',
  description: 'A guide to the AT Protocol repo structure.',
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
