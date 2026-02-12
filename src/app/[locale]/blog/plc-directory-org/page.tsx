import { Page } from '@/components/Page'

export const metadata = {
  title: 'Creating an Independent Public Ledger of Credentials (PLC) Directory Organization',
  description: 'As the next step of maturing governance of the PLC identity system, Bluesky Social PBC is supporting the creation of an independent organization to operate the PLC directory.',
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
