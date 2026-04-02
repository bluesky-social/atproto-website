import { Page } from '@/components/Page'

export const metadata = {
  title: 'Kicking off the ATP Working Group at the IETF',
  description: 'The Authenticated Transfer Protocol working group has been created at the IETF. Now that we have a charter, we are looking forward to participation from the broader ATP ecosystem. ',
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
