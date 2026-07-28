import { Page } from '@/components/Page'
import * as en from './en.mdx'

// This page's MDX carries `metadata` rather than a `header`, so it supplies the
// route metadata from there. <Page> still receives the whole module, and with no
// `header` prop it renders no PageHeader — the MDX provides its own heading,
// which is the existing behaviour. English is imported statically so it can be
// the fallback and so content edits hot-reload.

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
  return <Page {...content} />
}
