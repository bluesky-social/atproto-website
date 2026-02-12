import { Page } from '@/components/Page'

export const metadata = {
  title: 'Meet the second batch of AT Protocol Grant Recipients',
  description: 'Announcing the second batch of AT Protocol grant recipients, distributing $4,800 total in grants.',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
