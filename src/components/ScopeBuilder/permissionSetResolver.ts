export interface ParsedRef {
  did: string
  nsid: string
}

export type ResolveErrorCode =
  | 'invalid-input'
  | 'did-unresolvable'
  | 'no-pds'
  | 'record-not-found'
  | 'not-permission-set'
  | 'network'

export interface ResolveError {
  code: ResolveErrorCode
  message: string
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: ResolveError }

export type FetchFn = typeof fetch

import { isNsid } from '@atproto/oauth-scopes'

const LEXICON_COLLECTION = 'com.atproto.lexicon.schema'

function isSupportedDid(did: string): boolean {
  return did.startsWith('did:plc:') || did.startsWith('did:web:')
}

function fail(code: ResolveErrorCode, message: string): { ok: false; error: ResolveError } {
  return { ok: false, error: { code, message } }
}

function ok<T>(value: T): { ok: true; value: T } {
  return { ok: true, value }
}

/**
 * Accepts exactly two link forms, both of which carry the DID and NSID:
 *   - https://lexicon.garden/lexicon/{did}/{nsid}
 *   - at://{did}/com.atproto.lexicon.schema/{nsid}
 * Bare NSIDs are intentionally unsupported (would require DNS authority
 * resolution, which the browser can't do without DNS-over-HTTPS).
 */
export function parsePermissionSetRef(input: string): Result<ParsedRef> {
  const trimmed = input.trim()
  if (!trimmed) return fail('invalid-input', 'Paste a lexicon.garden or at:// link.')

  let did: string | undefined
  let nsid: string | undefined

  if (trimmed.startsWith('at://')) {
    const rest = trimmed.slice('at://'.length)
    const parts = rest.split('/')
    if (parts.length === 3 && parts[1] === LEXICON_COLLECTION) {
      did = parts[0]
      nsid = parts[2]
    }
  } else {
    let url: URL | undefined
    try {
      url = new URL(trimmed)
    } catch {
      url = undefined
    }
    if (url && url.hostname === 'lexicon.garden') {
      const segments = url.pathname.split('/').filter(Boolean)
      if (segments.length === 3 && segments[0] === 'lexicon') {
        did = segments[1]
        nsid = segments[2]
      }
    }
  }

  if (!did || !nsid) {
    return fail(
      'invalid-input',
      'Expected a lexicon.garden link or an at:// URI pointing at a com.atproto.lexicon.schema record.',
    )
  }
  if (!isSupportedDid(did)) {
    return fail('invalid-input', `Unsupported DID: ${did}. Only did:plc and did:web are supported.`)
  }
  if (!isNsid(nsid)) {
    return fail('invalid-input', `Not a valid NSID: ${nsid}.`)
  }

  return ok({ did, nsid })
}
