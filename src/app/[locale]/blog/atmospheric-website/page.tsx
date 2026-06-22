import { Page } from '@/components/Page'

export const metadata = {
  title: 'Build an Atmospheric Website',
  description:
    'Watch the episode and follow along to build a website on AT Protocol.',
}

export default async function AtmosphericWebsitePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${(await params).locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
