/**
 * authors.json is a name → DID map. It is what turns a byline into a link to
 * someone's Bluesky profile, so a name missing from it renders as plain text —
 * quietly, with nothing to indicate a link was intended.
 *
 * Pure: no filesystem access here. Reading and writing the file lives in
 * ./authorsFile.ts, which owns the warn-don't-fail semantics.
 */
export type AuthorMap = Record<string, string>

export function resolveAuthorDid(authors: AuthorMap, name: string): string | null {
  return authors[name] ?? null
}

export function withAuthor(
  authors: AuthorMap,
  name: string,
  did: string,
): AuthorMap {
  return { ...authors, [name]: did }
}

/**
 * The names this map has no DID for, in the order given, without duplicates.
 *
 * Matching is exact — the same comparison `resolveAuthorDid` makes — because a
 * key only produces a link if it equals the name written in the content header
 * character for character.
 *
 * Blank entries are dropped: hosts and guests come from comma-separated text
 * fields, so empty segments are routine while typing.
 */
export function unknownAuthors(
  authors: AuthorMap,
  names: readonly string[],
): string[] {
  const out: string[] = []
  for (const name of names) {
    if (!name || !name.trim()) continue
    if (resolveAuthorDid(authors, name)) continue
    if (out.includes(name)) continue
    out.push(name)
  }
  return out
}

// did:<method>:<method-specific-id>. Anchored with no allowance for surrounding
// whitespace: a DID is usually pasted, and a trailing newline would produce a
// profile link that 404s.
const DID_RE = /^did:[a-z]+:[a-zA-Z0-9._:%-]+$/

export function isValidDid(did: string): boolean {
  return DID_RE.test(did)
}

export type MergeResult = {
  map: AuthorMap
  /** Names whose DID was supplied but malformed, so nothing was written. */
  rejected: string[]
  /** False when the result is identical to the input, so no write is needed. */
  changed: boolean
}

/**
 * Fold a name → DID map from a form into authors.json's map.
 *
 * Never overwrites a name already present: the recorded DID is the one the site
 * has been linking to, and a form field shouldn't quietly repoint an existing
 * author. Blank DIDs are skipped silently ("I don't have it yet" is not an
 * error); malformed ones are skipped and reported, so the caller can say which
 * name was dropped instead of writing junk that renders as a dead link.
 */
export function mergeAuthorDids(
  authors: AuthorMap,
  dids: Record<string, string>,
): MergeResult {
  const map: AuthorMap = { ...authors }
  const rejected: string[] = []
  let changed = false

  for (const [name, raw] of Object.entries(dids)) {
    if (!name.trim()) continue
    if (!raw || !raw.trim()) continue
    if (resolveAuthorDid(authors, name)) continue
    if (!isValidDid(raw)) {
      rejected.push(name)
      continue
    }
    map[name] = raw
    changed = true
  }

  return { map, rejected, changed }
}
