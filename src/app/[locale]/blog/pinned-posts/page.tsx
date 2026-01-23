import { Page } from '@/components/Page'

export const metadata = {
  title: 'Lexicons, Pinned Posts, and Interoperability',
  description: 'A discussion of Lexicons, schema extensions, and lessons learned from the pinned posts feature collision.',
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
