import { Page } from '@/components/Page'

export const metadata = {
  title: 'Report-Based Moderation in Ozone',
  description: 'A report-centric workflow for Ozone with new queues, assignments, real-time collaboration, and a per-report activity log.',
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
