import { Page } from '@/components/Page'

export const metadata = {
  title: 'Why are blocks on Bluesky public?',
  description: 'The technical implementation of public blocks and some possibilities for more privacy preserving block implementations.',
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
