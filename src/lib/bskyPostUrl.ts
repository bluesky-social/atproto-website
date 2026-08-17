/**
 * bsky.app post URLs ↔ AT URIs.
 *
 * MUST STAY FREE OF NODE BUILT-INS. Imported by the studio's blog editor (a
 * client component) and by the discussion resolver that runs in the browser.
 *
 * The accepted shape is fixed by two consumers that already exist: `toAtUri` in
 * public/bsky-conversation.js takes only a bsky.app URL, and resolveBskyPostRef
 * in scripts/publish-post.mjs parses the same form to build the strongRef stored
 * on the standard.site record. Anything either would reject must not be written
 * to an MDX header.
 */

const POST_URL_RE =
  /^https:\/\/bsky\.app\/profile\/([^/\s]+)\/post\/([^/?#\s]+)$/

export function isBskyPostUrl(value: string): boolean {
  return POST_URL_RE.test(value.trim())
}

export type AtUriParts = { repo: string; collection: string; rkey: string }

export function parseAtUri(uri: string): AtUriParts | null {
  const m = /^at:\/\/([^/\s]+)\/([^/\s]+)\/([^/?#\s]+)$/.exec(uri.trim())
  if (!m) return null
  return { repo: m[1], collection: m[2], rkey: m[3] }
}

/**
 * `at://<did>/app.bsky.feed.post/<rkey>` → the bsky.app URL.
 *
 * Returns null for a URI in any other collection: a standard.site document URI
 * is the same shape, and handing one to the conversation component would render
 * an empty section rather than an obvious failure.
 */
export function atUriToBskyPostUrl(atUri: string): string | null {
  const parts = parseAtUri(atUri)
  if (!parts || parts.collection !== 'app.bsky.feed.post') return null
  return `https://bsky.app/profile/${parts.repo}/post/${parts.rkey}`
}
