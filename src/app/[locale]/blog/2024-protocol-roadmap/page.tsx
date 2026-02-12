import { Page } from '@/components/Page'

export const metadata = {
  title: '2024 Protocol Roadmap',
  description: 'An update on our progress and our general goals and focus for the coming months.',
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
