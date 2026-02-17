import { Page } from '@/components/Page'

export const metadata = {
  title: 'Labeling Services Microgrants',
  description: 'Launching microgrants for labeling services on Bluesky to support moderation and community safety.',
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
