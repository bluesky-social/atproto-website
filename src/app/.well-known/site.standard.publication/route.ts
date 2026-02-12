/**
 * Verification endpoint for site.standard.publication
 *
 * Returns the AT-URI of the publication record, confirming the link
 * between this domain and the AT Protocol publication.
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
