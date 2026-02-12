import { Page } from '@/components/Page'

export const metadata = {
  title: 'Looking Back At 2024 AT Protocol Development',
  description: 'A lot of progress was made on the protocol in 2024, here\'s a look at the big milestones',
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
