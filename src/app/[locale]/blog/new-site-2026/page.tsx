import { Page } from '@/components/Page'

export const metadata = {
  title: 'Welcome to the new atproto.com',
  description: 'We\'ve updated just about everything about atproto.com to make it easier for developers to just build things.',
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
