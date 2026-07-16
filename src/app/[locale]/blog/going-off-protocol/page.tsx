import { Page } from '@/components/Page'

export const metadata = {
  title: 'Going Off Protocol',
  description: 'We\'re expanding our office hours livestream. Look for it wherever you get your podcasts.',
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
