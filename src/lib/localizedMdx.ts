/**
 * Helpers shared by every content `page.tsx`.
 *
 * These exist so the locale-fallback rule and the header/metadata lookup are
 * defined and tested once, rather than regenerated into ~130 route files where a
 * subtle difference between copies would go unnoticed. The dynamic `import()`
 * itself has to stay in the page — webpack resolves it relative to that file —
 * so it's passed in as a loader.
 */

type MdxModule = { header?: unknown; metadata?: unknown }

/**
 * Resolve the MDX module for the requested locale, falling back to English.
 *
 * English short-circuits: it's already imported statically by the caller, which
 * is what gives the route a real module-graph edge for hot reload. A locale with
 * no translated file falls back rather than failing — coverage is partial by
 * design (ja/ko/pt, not every page).
 */
export async function resolveLocaleMdx<T extends MdxModule>(
  params: Promise<{ locale?: string }> | { locale?: string },
  en: T,
  load: (locale: string) => Promise<T>,
): Promise<T> {
  const { locale } = await params
  if (!locale || locale === 'en') return en
  try {
    return await load(locale)
  } catch {
    return en
  }
}

/**
 * The title and description a route should report, read from the MDX module.
 *
 * Prefers `header`, the convention nearly every file uses, and falls back to the
 * older `metadata` export that a couple of pages still carry (see mdx.d.ts).
 * Returns undefined fields rather than throwing: a content file with neither is
 * a bug worth surfacing as a missing title, not a 500.
 */
export function mdxRouteMetadata(mod: MdxModule): {
  title: string | undefined
  description: string | undefined
} {
  const source = (mod.header ?? mod.metadata ?? {}) as {
    title?: string
    description?: string
  }
  return { title: source.title, description: source.description }
}
