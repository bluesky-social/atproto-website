import { Page } from '@/components/Page'

export const metadata = {
  title: 'AT URI scheme (at://)',
  description: 'A URI scheme for addressing ATP repository data.',
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
