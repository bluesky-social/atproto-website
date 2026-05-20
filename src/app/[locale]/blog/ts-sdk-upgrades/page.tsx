import { Page } from '@/components/Page'

export const metadata = {
  title: 'TypeScript SDK Upgrades',
  description: 'Modernizing our TS packages and moving the lex SDK closer to 1.0',
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
