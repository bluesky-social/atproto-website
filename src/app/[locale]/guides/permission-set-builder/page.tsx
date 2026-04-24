import { Page } from '@/components/Page'

export const metadata = {
  title: 'Permission Set Builder - AT Protocol Docs',
  description: 'Interactive tool for defining permission sets for your Lexicons.',
}

export default async function PermissionSetBuilderPage({ params }: any) {
  let Content
  try {
    Content = await import(`./${params.locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
