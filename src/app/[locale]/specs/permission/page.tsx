import { Page } from '@/components/Page'
import { mdxRouteMetadata, resolveLocaleMdx } from '@/lib/localizedMdx'
import * as en from './en.mdx'

// Metadata is read from the requested locale's own header, so a translated page
// gets a translated <title>. English is imported statically so it can be the
// fallback and so content edits hot-reload; other locales resolve per request.
const load = (locale: string) => import(`./${locale}.mdx`)

export async function generateMetadata({ params }: any) {
  return mdxRouteMetadata(await resolveLocaleMdx(params, en, load))
}

export default async function HomePage({ params }: any) {
  return <Page {...(await resolveLocaleMdx(params, en, load))} />
}
