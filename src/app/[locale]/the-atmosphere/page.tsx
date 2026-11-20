import { Page } from '@/components/Page'

export const metadata = {
  title: 'The Atmosphere - AT Protocol',
  description:
    'The Atmosphere is a new open network built on the AT Protocol.',
}

export default async function TheAtmospherePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
