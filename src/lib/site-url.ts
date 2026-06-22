// The origin used to resolve absolute metadata URLs (metadataBase) — notably
// the `opengraph-image` file convention and the default social card.
//
// On Render PR previews we want metadata to resolve against the preview's own
// URL, so an OG image points at the deploy you're actually looking at rather
// than production (where an unmerged episode's image doesn't exist yet). Render
// sets IS_PULL_REQUEST=true and RENDER_EXTERNAL_URL on preview deploys. On the
// production deploy (and locally) we use the canonical origin.
const CANONICAL_ORIGIN = 'https://atproto.com'

export function resolveSiteOrigin(
  env: Record<string, string | undefined> = process.env,
): string {
  if (env.IS_PULL_REQUEST === 'true' && env.RENDER_EXTERNAL_URL) {
    return env.RENDER_EXTERNAL_URL
  }
  return CANONICAL_ORIGIN
}
