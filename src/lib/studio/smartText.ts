import { retext } from 'retext'
import retextSmartypants from 'retext-smartypants'
import { SMART_TYPOGRAPHY_OPTIONS } from '@/mdx/remark.mjs'

/**
 * Apply the site's smart typography to a plain string — a title or description.
 *
 * Those live in `episodes.ts` / `posts.ts` entries and in `page.tsx` metadata as
 * JS strings, not MDX prose, so the remark pipeline never sees them: without
 * this, a title types out as "Nothing Is Ever Over" while the body around it
 * gets curly quotes.
 *
 * Uses retext rather than remark deliberately. remark would parse the string as
 * markdown and escape syntax characters on stringify, so a title containing
 * `*`, `_`, or `#` would come back mangled. retext treats the input as natural
 * language and leaves those alone.
 *
 * Options are imported from the prose pipeline so the two can't drift.
 */
const processor = retext().use(retextSmartypants, SMART_TYPOGRAPHY_OPTIONS)

export function smartText(value: string): string {
  if (!value.trim()) return value
  return String(processor.processSync(value))
}

/**
 * Smarten the two prose fields the studio owns, leaving everything else — slugs,
 * dates, URLs, author and host names — exactly as given.
 */
export function smartenTitleAndDescription<
  T extends { title: string; description: string },
>(value: T): T {
  return {
    ...value,
    title: smartText(value.title),
    description: smartText(value.description),
  }
}
