// scripts/lib/parseBskyUrl.mjs

/**
 * Parses a bsky.app post URL into its identifier and rkey.
 *
 * Accepts both handle-form (`/profile/atproto.com/...`) and DID-form
 * (`/profile/did:plc:.../...`) URLs. Returns the literal `handleOrDid`
 * string; the caller resolves handles to DIDs separately when needed.
 */
export function parseBskyUrl(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`Invalid URL: ${url}`)
  }
  if (parsed.hostname !== 'bsky.app') {
    throw new Error(`Not a bsky.app post URL: ${url}`)
  }
  const match = parsed.pathname.match(/^\/profile\/([^/]+)\/post\/([^/]+)\/?$/)
  if (!match) {
    throw new Error(`Missing rkey in bsky URL: ${url}`)
  }
  return { handleOrDid: match[1], rkey: match[2] }
}
