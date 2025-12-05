import { Page } from '@/components/Page'

export const metadata = {
  title: 'Account Lifecyle Events',
  description: 'Account Lifecycle Best Practices.',
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
