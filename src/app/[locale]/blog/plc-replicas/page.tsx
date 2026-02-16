import { Page } from '@/components/Page'

export const metadata = {
  title: 'PLC Read Replicas',
  description: 'Introducing a self-hostable did:plc read-replica service',
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
