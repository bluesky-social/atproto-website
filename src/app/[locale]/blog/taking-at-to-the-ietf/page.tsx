import { Page } from '@/components/Page'

export const metadata = {
  title: 'Taking AT to the IETF',
  description: 'We recently posted two drafts to the IETF Data Tracker. This is the first major step towards standardizing parts of AT in an effort to establish long-term governance for the protocol.',
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
