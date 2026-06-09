import { Page } from '@/components/Page'

export const metadata = {
  title: 'Scope Builder - AT Protocol Docs',
  description: 'Interactive tool for building OAuth scope strings and permission sets.',
}

export default async function ScopeBuilderPage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
