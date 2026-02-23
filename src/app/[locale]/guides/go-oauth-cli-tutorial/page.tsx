import { Page } from '@/components/Page'

export const metadata = {
  title: 'OAuth for CLI Apps (Go)',
  description: 'Authenticate with atproto OAuth from a Go command-line app.',
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
