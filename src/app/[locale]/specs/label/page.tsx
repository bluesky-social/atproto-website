import { Page } from '@/components/Page'

export const metadata = {
  title: 'Labels',
  description:
    'Self-authenticating string annotations on accounts or content for moderation and other purposes.',
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
