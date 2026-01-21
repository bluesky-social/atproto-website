/**
 * Renders a <link> tag for site.standard.document verification.
 * Next.js automatically hoists this to the <head>.
 *
 * Usage in MDX or pages:
 *   <AtprotoDocumentLink uri="at://did:plc:xxx/site.standard.document/xxx" />
 */

export function AtprotoDocumentLink({ uri }: { uri?: string }) {
  if (!uri) return null

  return <link rel="site.standard.document" href={uri} />
}
