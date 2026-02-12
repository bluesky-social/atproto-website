import { Page } from '@/components/Page'

export const metadata = {
  title: 'OAuth Improvements',
  description: 'We\'ve been making improvements to the end-user and developer experiences with atproto OAuth.',
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
