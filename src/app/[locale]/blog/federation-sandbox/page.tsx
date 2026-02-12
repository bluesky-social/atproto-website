import { Page } from '@/components/Page'

export const metadata = {
  title: 'Federation Developer Sandbox Guidelines',
  description: 'Guidelines for the atproto federation developer sandbox environment.',
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
