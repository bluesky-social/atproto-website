import { Page } from '@/components/Page'

export const metadata = {
  title: 'Building on the AT Protocol',
  description: 'What you can already build on atproto, and what you can expect soon.',
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
