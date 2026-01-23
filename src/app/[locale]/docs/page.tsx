import { Page } from '@/components/Page'

export const metadata = {
  title: 'AT Protocol',
  description:
    'The AT Protocol is an open, decentralized, and high-performance network for building social applications.',
}

export default async function HomePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.tsx`)
  } catch (error) {
    Content = await import(`./en`)
  }
  return <Page {...Content} />
}
