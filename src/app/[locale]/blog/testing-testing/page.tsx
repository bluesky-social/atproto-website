import { Page } from '@/components/Page'

export const metadata = {
  title: 'This is a test post',
  description: 'A test post',
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
