/**
 * Percent-encodes the `#` in a DID service reference (e.g. did:web:x#type → did:web:x%23type).
 */
export function encodeAudDid(aud: string): string {
  if (!aud || aud === '*') return aud
  return aud.replace('#', '%23')
}
