/**
 * Percent-encodes the `#` in a DID service reference (e.g. did:web:x#type → did:web:x%23type).
 */
export function encodeAudDid(aud: string): string {
  if (!aud || aud === '*') return aud
  return aud.replace('#', '%23')
}

export function isValidNsid(nsid: string): boolean {
  if (!nsid) return false
  return /^[a-z0-9]+(\.[a-z0-9]+){2,}$/.test(nsid)
}

export function isPartialWildcard(value: string): boolean {
  if (value === '*') return false
  return value.includes('*')
}
