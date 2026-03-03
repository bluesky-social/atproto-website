import { Page } from '@/components/Page'

export const metadata = {
  title: 'Supporting the npmx Alpha Launch',
  description: 'The launch of npmx is an incredible showcase for how open source communities can build quickly on top of atproto.',
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
