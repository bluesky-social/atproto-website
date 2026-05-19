/**
 * Renders a <link> tag for site.standard.publication verification.
 * The publication URI is shared across the site, sourced from
 * ATPROTO_PUBLICATION_URI (same value served by /.well-known/site.standard.publication).
 */

export function AtprotoPublicationLink() {
  const uri = process.env.ATPROTO_PUBLICATION_URI
  if (!uri) return null

  return <link rel="site.standard.publication" href={uri} />
}
