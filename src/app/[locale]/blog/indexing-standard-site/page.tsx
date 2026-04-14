import { Page } from '@/components/Page'

export const metadata = {
  title: 'Indexing Standard Site',
  description: 'This guest post from Steve Simkins, creator of Sequoia and docs.surf, outlines the strategy he used to index standard.site records.',
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
