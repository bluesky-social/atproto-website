import * as en from './en.mdx'

// This page's MDX renders its own `# h1` and carries no `header`, so it takes
// its metadata from the MDX `metadata` export and renders the content directly
// rather than through <Page> — deliberately different from its neighbours.
// English is imported statically so it can be the fallback and so content edits
// hot-reload; other locales resolve per request.

export function generateMetadata() {
  return {
    title: en.metadata.title,
    description: en.metadata.description,
  }
}

export default async function HomePage({ params }: any) {
  const { locale } = await params
  const content =
    locale === 'en' ? en : await import(`./${locale}.mdx`).catch(() => en)
  const Content = content.default
  return <Content />
}
