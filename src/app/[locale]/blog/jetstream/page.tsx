import { Page } from '@/components/Page'

export const metadata = {
  title: 'Introducing Jetstream',
  description: 'Introducing Jetstream, an alternative streaming solution with simple JSON encoding and reduced bandwidth.',
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
