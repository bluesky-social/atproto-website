import { smartText } from '@/mdx/smartText.mjs'

// The implementation lives in src/mdx/smartText.mjs so the .mjs authoring CLIs
// can import it too — see that file for why it uses retext rather than remark.
export { smartText }

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
