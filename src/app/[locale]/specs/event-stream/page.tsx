export const metadata = {
  title: 'Event Stream',
  description:
    'Network wire protocol for subscribing to a stream of Lexicon objects',
  wip: true,
}
import { Page } from '@/components/Page'

export default async function HomePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
