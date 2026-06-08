import { Page } from '@/components/Page'

export const metadata = {
  title: 'Account Recovery',
  description: 'Self-custodying your AT Protocol identity with rotation keys.',
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
