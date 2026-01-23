import { Page } from '@/components/Page'

export const metadata = {
  title: 'Early Access Federation for Self-Hosters',
  description: 'Releasing an early-access version of federation intended for self-hosters and developers.',
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
