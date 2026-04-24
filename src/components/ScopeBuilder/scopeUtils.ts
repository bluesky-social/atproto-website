import type {
  CuratedScope,
  Permission,
  PermissionSetMeta,
  PermissionSetLexicon,
  PermissionJsonForm,
} from './types'

/**
 * Percent-encodes the `#` in a DID service reference (e.g. did:web:x#type → did:web:x%23type).
 */
export function encodeAudDid(aud: string): string {
  if (!aud || aud === '*') return aud
  return aud.replace('#', '%23')
}

// Per the atproto NSID spec, authority segments must be lowercase alphanumeric
// (minimum two segments), and the final name segment allows mixed case and
// digits but must start with a letter — this matches the camelCase
// convention used for most lexicon names (e.g. `app.bsky.feed.getTimeline`).
export function isValidNsid(nsid: string): boolean {
  if (!nsid) return false
  return /^[a-z0-9]+(\.[a-z0-9]+)+\.[A-Za-z][A-Za-z0-9]*$/.test(nsid)
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

export function buildIncludeScopeString(setNsid: string, aud: string): string {
  if (!aud) return `include:${setNsid}`
  return `include:${setNsid}?aud=${encodeAudDid(aud)}`
}

/**
 * Emits the final scope string for a curated entry, respecting an optional
 * user-provided audience override.
 *
 * - For scopes without `defaultAud`, returns `scope.scopeString` unchanged.
 * - For scopes with `defaultAud`, rebuilds the string using `audOverride` if
 *   defined (including `''`, which means "user cleared the field → omit aud"),
 *   or `scope.defaultAud` otherwise. Percent-encodes the `#` in the result.
 *
 * `audOverride === undefined` means "no override, use default." An empty
 * string explicitly means "the user wants no aud suffix."
 */
export function emitCuratedScopeString(
  scope: CuratedScope,
  audOverride: string | undefined,
): string {
  if (!scope.defaultAud) return scope.scopeString
  const aud = audOverride !== undefined ? audOverride : scope.defaultAud
  return buildIncludeScopeString(scope.id, aud)
}

export function isInSetNamespace(setNsid: string, candidateNsid: string): boolean {
  if (candidateNsid === '*') return true
  const setParts = setNsid.split('.')
  const setNamespace = setParts.slice(0, -1).join('.')
  if (!setNamespace) return false
  return candidateNsid === setNamespace || candidateNsid.startsWith(setNamespace + '.')
}

export function buildPermissionSetLexicon(meta: PermissionSetMeta, permissions: Permission[]): PermissionSetLexicon {
  const jsonPermissions: PermissionJsonForm[] = permissions
    .filter((p) => p.resource === 'repo' || p.resource === 'rpc')
    .map((p) => {
      if (p.resource === 'repo') {
        const out: PermissionJsonForm = { type: 'permission', resource: 'repo', collection: [p.collection ?? '*'] }
        if (p.actions && p.actions.length > 0) out.action = [...p.actions]
        return out
      }
      const out: PermissionJsonForm = { type: 'permission', resource: 'rpc', lxm: [p.lxm ?? '*'] }
      if (p.inheritAud) out.inheritAud = true
      else if (p.aud) out.aud = p.aud
      return out
    })

  return {
    lexicon: 1,
    id: meta.nsid,
    defs: {
      main: {
        type: 'permission-set',
        title: meta.title,
        detail: meta.detail,
        permissions: jsonPermissions,
      },
    },
  }
}
