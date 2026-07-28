import { Page } from '@/components/Page'
import * as en from './en.mdx'

// Guides are translated, so the locale variant is still resolved at request
// time. English is imported statically anyway: it's the fallback, it's the file
// authors actually edit (so it gets a real module-graph edge for hot reload),
// and its header supplies the metadata rather than a duplicated copy.
//
// Metadata stays English for every locale — same as before this change. Reading
// the locale's own header would localize titles, which is worth doing but is a
// visible change across ~70 translated pages, so it's deliberately out of scope.

export function generateMetadata() {
  return {
    title: en.header.title,
    description: en.header.description,
  }
}

export default async function GuidePage({ params }: any) {
  const { locale } = await params
  const content =
    locale === 'en' ? en : await import(`./${locale}.mdx`).catch(() => en)
  return <Page {...content} />
}
