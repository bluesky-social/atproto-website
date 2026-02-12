import { Page } from '@/components/Page'

export const metadata = {
  title: 'OAuth with NextJS Tutorial',
  description: 'Build a Next.js app supporting OAuth with ATProto identity.',
}

export default async function HomePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
