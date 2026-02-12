import { Page } from '@/components/Page'

export const metadata = {
  title: 'Protocol Check-in (Fall 2025)',
  description: 'The Atmosphere is thriving, here\'s a closer look',
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
