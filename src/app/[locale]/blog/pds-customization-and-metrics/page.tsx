import { Page } from '@/components/Page'

export const metadata = {
  title: 'Make the PDS Your Own: Customization and Metrics',
  description:
    'Branding, observability, and a session-list fix in the newest reference PDS',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(`./${(await params).locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
