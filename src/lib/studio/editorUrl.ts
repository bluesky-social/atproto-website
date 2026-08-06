/**
 * The editor's address bar: which post or episode a studio tab has open.
 *
 * Both editors used to keep that in `useState` alone, so anything that reloaded
 * the tab — a dev-server full reload, ⌘R, a crash — dropped the editor back to
 * its "new" form. In the episode editor that was worse than losing the text: the
 * default slug is date-derived, so it stays non-empty with an empty title, and
 * the next Save created a date-named episode instead of updating the one being
 * edited.
 *
 * Putting the slug in the query string makes the open document addressable, so a
 * reload restores it from disk rather than guessing.
 *
 * MUST STAY FREE OF NODE BUILT-INS. The editors are `'use client'` components,
 * so everything reachable from here ends up in the browser bundle.
 */

/**
 * Whether a string names a post or episode directory this editor may open.
 *
 * Slugs are made by `slugify` in src/lib/slugs.mjs — lowercase alphanumerics
 * separated by single hyphens — and every directory under `[locale]/blog` and
 * `[locale]/off-protocol` matches. Now that the slug can arrive from the query
 * string it is checked before use: the API routes interpolate it into a path
 * with `path.join` and no validation of their own, and those directories also
 * hold `page.tsx` and `layout.tsx`, which are not content.
 */
export function isEditableSlug(slug: string | null | undefined): boolean {
  if (typeof slug !== 'string') return false
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)
}

/**
 * The slug a studio tab was opened with, or '' for the "new" form.
 *
 * Anything unusable — absent, empty, hand-mangled, or trying to climb out of the
 * content directory — reads as '' so the editor starts a new document instead of
 * fetching something it shouldn't.
 */
export function slugFromSearch(search: string): string {
  const slug = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  ).get('slug')
  return isEditableSlug(slug) ? slug! : ''
}

/**
 * `search` with `slug` set, or with it removed when there is no slug.
 *
 * Other params are preserved and the result is idempotent, because this is
 * handed to `history.replaceState` on load as well as after every load of a
 * document.
 */
export function searchWithSlug(search: string, slug: string): string {
  const params = new URLSearchParams(
    search.startsWith('?') ? search.slice(1) : search,
  )
  if (isEditableSlug(slug)) {
    params.set('slug', slug)
  } else {
    params.delete('slug')
  }
  const next = params.toString()
  return next ? `?${next}` : ''
}
