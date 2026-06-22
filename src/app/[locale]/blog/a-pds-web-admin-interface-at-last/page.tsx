import { Page } from '@/components/Page'

export const metadata = {
  title: 'A PDS Web Admin Interface?? At Last!',
  description: 'Announcing the addition of an account management interface to the reference PDS',
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
