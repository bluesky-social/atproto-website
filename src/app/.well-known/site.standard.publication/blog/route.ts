/**
 * Verification endpoint for site.standard.publication
 *
 * Returns the AT-URI of the publication record, confirming the link
 * between this domain and the AT Protocol publication.
 *
 * Served at /.well-known/site.standard.publication/blog (NOT the domain
 * root) on purpose: our publication's url is https://atproto.com/blog, a
 * non-root publication. Per the standard.site verification spec, consumers
 * derive the endpoint by appending the publication's url path to
 * /.well-known/site.standard.publication, so the file must live under /blog.
 * See https://standard.site/docs/verification/#non-root-publications
 *
 * Set ATPROTO_PUBLICATION_URI in your environment variables.
 */

export async function GET() {
  const publicationUri = process.env.ATPROTO_PUBLICATION_URI

  if (!publicationUri) {
    return new Response('Publication URI not configured', { status: 404 })
  }

  return new Response(publicationUri, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
