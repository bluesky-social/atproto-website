import { Page } from '@/components/Page'

export const metadata = {
  title: 'Introducing Tap: Repository Synchronization Made Simple',
  description: 'We recently released Tap, a tool designed to handle the hard parts of repo synchronization, so you can focus on building your application.',
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
