/**
 * Resolve a post's Bluesky thread from its standard.site document record.
 *
 * Why this exists: `blueskyPostUrl` in an MDX header is baked into the page at
 * build time, so adding a thread to an already-deployed post used to need a site
 * rebuild. The record is mutable without one — `npm run blog ssite <slug>` writes
 * `bskyPostRef` onto it — so the page reads the record at runtime instead.
 *
 * MUST STAY FREE OF NODE BUILT-INS. This runs in the browser, from
 * BlueskyConversation.
 */

import { atUriToBskyPostUrl, parseAtUri } from './bskyPostUrl'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * The `bskyPostRef.uri` on a `com.atproto.repo.getRecord` response, or null.
 *
 * Null covers the case this whole feature is built around: the article is
 * published but the thread doesn't exist yet, so the record has no ref.
 */
export function bskyPostRefUri(record: unknown): string | null {
  if (!isRecord(record)) return null
  const value = record.value
  if (!isRecord(value)) return null
  const ref = value.bskyPostRef
  if (!isRecord(ref)) return null
  return typeof ref.uri === 'string' ? ref.uri : null
}

/** The `#atproto_pds` service endpoint in a DID document, or null. */
export function pdsEndpoint(didDoc: unknown): string | null {
  if (!isRecord(didDoc) || !Array.isArray(didDoc.service)) return null
  for (const entry of didDoc.service) {
    if (!isRecord(entry)) continue
    if (entry.id !== '#atproto_pds') continue
    return typeof entry.serviceEndpoint === 'string' ? entry.serviceEndpoint : null
  }
  return null
}

// Same shape and name as ScopeBuilder/permissionSetResolver.ts's FetchFn: a
// defaulted fetch-like param, so the DID → PDS → getRecord chain below can be
// driven with a stub in tests instead of the real network.
export type FetchFn = typeof fetch

async function fetchJson(url: string, fetchFn: FetchFn): Promise<unknown> {
  const res = await fetchFn(url)
  if (!res.ok) throw new Error(`${res.status} for ${url}`)
  return res.json()
}

/**
 * Resolve the DID's PDS. `com.atproto.repo.getRecord` is served by the PDS
 * holding the repo, not by an appview, so the document has to be resolved first.
 */
async function resolvePds(did: string, fetchFn: FetchFn): Promise<string | null> {
  if (did.startsWith('did:plc:')) {
    return pdsEndpoint(await fetchJson(`https://plc.directory/${did}`, fetchFn))
  }
  if (did.startsWith('did:web:')) {
    const host = did.slice('did:web:'.length)
    // Only the bare-host form. did:web with a path uses ':' as a separator and
    // no publication uses it; guessing wrong is worse than not resolving.
    if (!host || host.includes(':')) return null
    return pdsEndpoint(await fetchJson(`https://${host}/.well-known/did.json`, fetchFn))
  }
  return null
}

/**
 * The bsky.app URL for a document's thread, or null.
 *
 * Every failure — unparseable URI, unknown DID method, unreachable PDS, missing
 * record, no ref yet — is a null. A discussion section is not worth an error
 * state on an article page; the section simply doesn't appear.
 */
export async function fetchBskyPostUrl(
  documentUri: string,
  fetchFn: FetchFn = fetch,
): Promise<string | null> {
  try {
    const parts = parseAtUri(documentUri)
    if (!parts) return null
    const pds = await resolvePds(parts.repo, fetchFn)
    if (!pds) return null
    const url =
      `${pds.replace(/\/$/, '')}/xrpc/com.atproto.repo.getRecord` +
      `?repo=${encodeURIComponent(parts.repo)}` +
      `&collection=${encodeURIComponent(parts.collection)}` +
      `&rkey=${encodeURIComponent(parts.rkey)}`
    const refUri = bskyPostRefUri(await fetchJson(url, fetchFn))
    return refUri ? atUriToBskyPostUrl(refUri) : null
  } catch {
    return null
  }
}
