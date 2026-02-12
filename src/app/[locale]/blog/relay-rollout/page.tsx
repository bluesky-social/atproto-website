import { Page } from '@/components/Page'

export const metadata = {
  title: 'Upcoming Relay Transition',
  description: 'What the new relay rollout means for consumers of the firehose.',
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
