// scripts/lib/resolveBskyPostRef.mjs
import { parseBskyUrl } from './parseBskyUrl.mjs'

const PUBLIC_API = 'https://public.api.bsky.app/xrpc'

/**
 * Resolves a bsky.app post URL to a com.atproto.repo.strongRef
 * ({ uri, cid }) via the public AppView XRPC endpoints.
 *
 * The returned `uri` is always at://<did>/app.bsky.feed.post/<rkey>,
 * so the strongRef stays valid even if the author's handle changes.
 */
export async function resolveBskyPostRef(url) {
  const { handleOrDid, rkey } = parseBskyUrl(url)

  let did
  if (handleOrDid.startsWith('did:')) {
    did = handleOrDid
  } else {
    const res = await fetch(
      `${PUBLIC_API}/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handleOrDid)}`,
    )
    if (!res.ok) {
      throw new Error(
        `resolveHandle failed for ${handleOrDid}: HTTP ${res.status}`,
      )
    }
    did = (await res.json()).did
  }

  const res = await fetch(
    `${PUBLIC_API}/com.atproto.repo.getRecord` +
      `?repo=${encodeURIComponent(did)}` +
      `&collection=app.bsky.feed.post` +
      `&rkey=${encodeURIComponent(rkey)}`,
  )
  if (!res.ok) {
    throw new Error(
      `getRecord failed for ${did}/${rkey}: HTTP ${res.status}`,
    )
  }
  const record = await res.json()
  return {
    $type: 'com.atproto.repo.strongRef',
    uri: record.uri,
    cid: record.cid,
  }
}
