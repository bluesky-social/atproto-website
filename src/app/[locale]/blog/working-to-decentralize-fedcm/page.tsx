import { Page } from '@/components/Page'

export const metadata = {
  title: 'Working to Decentralize FedCM',
  description: 'Bluesky Social PBC have given a grant to Emelia Smith, an Invited Expert with the FedID Working Group, to work on FedCM with the goal of making FedCM really work for the decentralized web.',
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
