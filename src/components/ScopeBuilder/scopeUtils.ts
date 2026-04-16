import type { Permission } from './types'

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

export function buildScopeString(p: Permission): string {
  switch (p.resource) {
    case 'repo': {
      const base = `repo:${p.collection ?? '*'}`
      if (!p.actions || p.actions.length === 0) return base
      return `${base}?${p.actions.map((a) => `action=${a}`).join('&')}`
    }
    case 'rpc': {
      const audEncoded = encodeAudDid(p.aud ?? '')
      return `rpc:${p.lxm ?? '*'}?aud=${audEncoded}`
    }
    case 'blob': {
      const accepts = p.accept && p.accept.length > 0 ? p.accept : ['*/*']
      if (accepts.length === 1) return `blob:${accepts[0]}`
      return `blob?${accepts.map((a) => `accept=${a}`).join('&')}`
    }
    case 'account': {
      const base = `account:${p.attr ?? ''}`
      if (p.action && p.action !== 'read') return `${base}?action=${p.action}`
      return base
    }
    case 'identity': {
      return `identity:${p.attr ?? '*'}`
    }
  }
}

export function assembleScopeString(scopes: string[]): string {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const s of scopes) {
    if (s === 'atproto' || seen.has(s)) continue
    seen.add(s)
    ordered.push(s)
  }
  return ['atproto', ...ordered].join(' ')
}
