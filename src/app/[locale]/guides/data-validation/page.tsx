import { mdxRouteMetadata, resolveLocaleMdx } from '@/lib/localizedMdx'
import * as en from './en.mdx'

// Unlike its neighbours this page renders its MDX directly, with no <Page>
// wrapper: the content supplies its own heading. Metadata is read from the
// requested locale's own export — this file predates the `header` convention and
// uses `metadata`, which mdxRouteMetadata handles. English is imported
// statically so it can be the fallback and so content edits hot-reload.
const load = (locale: string) => import(`./${locale}.mdx`)

export async function generateMetadata({ params }: any) {
  return mdxRouteMetadata(await resolveLocaleMdx(params, en, load))
}

export default async function HomePage({ params }: any) {
  const content = await resolveLocaleMdx(params, en, load)
  const Content = content.default
  return <Content />
}
