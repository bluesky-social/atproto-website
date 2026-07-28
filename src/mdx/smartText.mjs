import { retext } from 'retext'
import retextSmartypants from 'retext-smartypants'
import { SMART_TYPOGRAPHY_OPTIONS } from './remark.mjs'

/**
 * Apply the site's smart typography to a plain string — a title or description.
 *
 * Those live in `episodes.ts` / `posts.ts` entries and in `page.tsx` metadata as
 * JS strings, not MDX prose, so the remark pipeline never sees them: without
 * this, a title reads "Like This" while the body around it is curled.
 *
 * Uses retext rather than remark deliberately. remark would parse the string as
 * markdown and escape syntax characters on stringify, so a title containing
 * `*`, `_`, or `#` would come back mangled. retext treats the input as natural
 * language and leaves those alone.
 *
 * Plain JS so the `.mjs` authoring CLIs and the TypeScript studio can share one
 * implementation. Options come from the prose pipeline so the two can't drift.
 *
 * @param {string} value
 * @returns {string}
 */
export function smartText(value) {
  if (!value.trim()) return value
  return String(processor.processSync(value))
}

const processor = retext().use(retextSmartypants, SMART_TYPOGRAPHY_OPTIONS)
