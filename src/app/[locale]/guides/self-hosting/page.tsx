import { Page } from '@/components/Page'

export const metadata = {
  title: 'Self-hosting',
  description:
    'Self-hosting a Bluesky PDS means running your own Personal Data Server that is capable of federating with the wider ATProto network.',
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
