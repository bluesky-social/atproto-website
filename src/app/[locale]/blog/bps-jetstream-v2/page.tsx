import { Page } from '@/components/Page'

export const metadata = {
  title: 'Introducing Bluesky Protocol Services',
  description:
    'A new home for Bluesky infrastructure, including Jetstream v2 with Replay.',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(`./${(await params).locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
