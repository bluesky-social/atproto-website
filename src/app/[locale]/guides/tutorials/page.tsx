import { Page } from '@/components/Page'

export const metadata = {
  title: 'Tutorials - AT Protocol Docs',
  description: 'Build an app that lets you broadcast and receive status updates using AT Record Lexicons.',
}

export default async function HomePage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
