import { Page } from '@/components/Page'

export const metadata = {
  title: 'Add Labels to Your App',
  description: 'Wire a Statusphere app to an Ozone labeler service to display and create labels.',
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
