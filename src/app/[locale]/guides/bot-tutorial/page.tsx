import { Page } from '@/components/Page'

export const metadata = {
  title: 'Build a Social bot',
  description: "Let's post a smiley face once every three hours.",
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
