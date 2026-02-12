import { Page } from '@/components/Page'

export const metadata = {
  title: 'Download and Parse Repository Exports',
  description: 'How to export and parse a data repository as a CAR file.',
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
