import { Page } from '@/components/Page'
import * as en from './en.mdx'

// Metadata comes from the MDX header (see mdx.d.ts), in English for every
// locale as before. English is imported statically so it can be the fallback
// and so content edits hot-reload; other locales resolve per request.

export function generateMetadata() {
  return {
    title: en.header.title,
    description: en.header.description,
  }
}

export default async function HomePage({ params }: any) {
  const { locale } = await params
  const content =
    locale === 'en' ? en : await import(`./${locale}.mdx`).catch(() => en)
  return <Page {...content} />
}
