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
import type { PermissionSetLexicon } from './types'

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
    // Exactly 3 segments: did / collection / rkey. A trailing slash yields a
    // 4th empty segment and is intentionally rejected here — do NOT add
    // .filter(Boolean), which would admit at:// URIs with trailing slashes.
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

function didWebToDocUrl(did: string): string {
  // did:web:example.com            -> https://example.com/.well-known/did.json
  // did:web:example.com:foo:bar    -> https://example.com/foo/bar/did.json
  const rest = did.slice('did:web:'.length)
  const segments = rest.split(':').map(decodeURIComponent)
  const host = segments[0]
  if (segments.length === 1) return `https://${host}/.well-known/did.json`
  return `https://${host}/${segments.slice(1).join('/')}/did.json`
}

interface DidDocument {
  id?: string
  service?: Array<{ id?: string; type?: string; serviceEndpoint?: unknown }>
}

function extractAtprotoPds(doc: DidDocument, did: string): string | undefined {
  const svc = doc.service?.find(
    (s) => s.id === '#atproto_pds' || s.id === `${did}#atproto_pds`,
  )
  return typeof svc?.serviceEndpoint === 'string' ? svc.serviceEndpoint : undefined
}

export async function resolveDidToPds(did: string, fetchFn: FetchFn = fetch): Promise<Result<string>> {
  const docUrl = did.startsWith('did:web:')
    ? didWebToDocUrl(did)
    : `https://plc.directory/${did}`

  let res: Response
  try {
    res = await fetchFn(docUrl)
  } catch {
    return fail('network', `Network error resolving ${did}.`)
  }
  if (!res.ok) return fail('did-unresolvable', `Could not resolve ${did} (HTTP ${res.status}).`)

  let doc: DidDocument
  try {
    doc = (await res.json()) as DidDocument
  } catch {
    return fail('did-unresolvable', `DID document for ${did} was not valid JSON.`)
  }

  const pds = extractAtprotoPds(doc, did)
  if (!pds) return fail('no-pds', `No atproto PDS endpoint found in the DID document for ${did}.`)
  return ok(pds.replace(/\/+$/, ''))
}

function isPermissionSetLexicon(value: unknown): value is PermissionSetLexicon {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  const defs = v.defs as Record<string, unknown> | undefined
  const main = defs?.main as Record<string, unknown> | undefined
  return !!main && main.type === 'permission-set' && Array.isArray(main.permissions)
}

export async function fetchPermissionSetRecord(
  pdsUrl: string,
  did: string,
  nsid: string,
  fetchFn: FetchFn = fetch,
): Promise<Result<PermissionSetLexicon>> {
  const url =
    `${pdsUrl}/xrpc/com.atproto.repo.getRecord` +
    `?repo=${did}&collection=com.atproto.lexicon.schema&rkey=${nsid}`

  let body: { value?: unknown }
  try {
    const res = await fetchFn(url)
    if (!res.ok) {
      return fail('record-not-found', `No permission set "${nsid}" found in that repo (HTTP ${res.status}).`)
    }
    body = (await res.json()) as { value?: unknown }
  } catch {
    return fail('network', `Network error fetching ${nsid}.`)
  }

  if (!isPermissionSetLexicon(body.value)) {
    return fail('not-permission-set', `The record "${nsid}" is not a permission set.`)
  }
  return ok(body.value)
}
