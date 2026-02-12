import { Page } from '@/components/Page'

export const metadata = {
  title: 'Announcing AT Protocol Grants',
  description: 'Announcing the AT Protocol Grants program, aimed at fostering the growth and sustainability of the atproto developer ecosystem.',
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
