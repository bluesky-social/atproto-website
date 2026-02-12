import { Page } from '@/components/Page'

export const metadata = {
  title: 'Posting via the Bluesky API',
  description: 'A guide to creating posts via the Bluesky API, including mentions, links, replies, quote posts, and image embeds.',
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
