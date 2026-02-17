import { Page } from '@/components/Page'

export const metadata = {
  title: 'Accounts and deletions',
  description: 'How account lifecycles and deletions work in AT Protocol',
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
