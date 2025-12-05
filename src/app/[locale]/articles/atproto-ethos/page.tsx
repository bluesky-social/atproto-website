import { Page } from '@/components/Page'

export const metadata = {
  title: 'Atproto Ethos',
  description:
    'A deep dive into the philosophical and aesthetic principles underlying the design of AT Protocol.',
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
