import { Page } from '@/components/Page'

export const metadata = {
  title: '2025 Protocol Roadmap (Spring and Summer)',
  description: 'Updates to the AT Protocol roadmap, including Sync v1.1, auth scopes, PDS account management, and more.',
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
