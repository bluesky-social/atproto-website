import { Page } from '@/components/Page'

export const metadata = {
  title: 'rpg.actor — What if Your RPG Character Could Log In to Any Game?',
  description: 'Carrying your adventures through many worlds with the AT Protocol',
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
