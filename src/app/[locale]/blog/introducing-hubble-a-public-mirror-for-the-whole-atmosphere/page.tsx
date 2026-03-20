import { Page } from '@/components/Page'

export const metadata = {
  title: 'Introducing Hubble: A Public Mirror for the Whole Atmosphere',
  description: 'Bluesky is providing a grant to the creator of Microcosm to build a full mirror of public data on the Atmosphere to help make the network more resilient.',
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
