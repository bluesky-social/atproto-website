import { Page } from '@/components/Page'

export const metadata = {
  title: 'Now in your timeline: Standard.site brings richer previews from across the open web',
  description: 'Articles published with this community-built format now receive richer treatment in the Bluesky app',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(`./${(await params).locale}.mdx`)
  } catch (error) {
    Content = await import(`./en.mdx`)
  }
  return <Page {...Content} />
}
