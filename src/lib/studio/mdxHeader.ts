export type HeaderEntry = { key: string; rawValue: string }
export type ParsedMdx = {
  preamble: string
  headerEntries: HeaderEntry[]
  body: string
}
export type OwnedFields = {
  title: string
  description: string
  date: string
  author: string
  blueskyPostUrl: string
}

export const OWNED_KEYS = [
  'title',
  'description',
  'date',
  'author',
  'blueskyPostUrl',
] as const

/**
 * Owned keys that are absent from the header when empty rather than written as
 * ''. A post has no Bluesky thread until one is posted, and the presence of the
 * key is what decides whether a discussion section exists — so an empty string
 * would advertise a discussion that isn't there. episodeHeader.ts omits the same
 * field on the same reasoning.
 */
const OPTIONAL_OWNED_KEYS: ReadonlySet<string> = new Set(['blueskyPostUrl'])

const HEADER_RE = /export\s+const\s+header\s*=\s*\{/

// A quote closes a string only when preceded by an even number of consecutive
// backslashes; an odd count means the quote itself is escaped.
function isEscapedAt(s: string, i: number): boolean {
  let n = 0
  for (let j = i - 1; j >= 0 && s[j] === '\\'; j--) n++
  return n % 2 === 1
}

// Escape order matters: backslashes first, so the escapes added afterwards
// aren't themselves doubled. Newlines and carriage returns must be escaped
// because a raw one closes nothing and simply breaks the literal — an
// unparseable episodes.ts/posts.ts fails the whole build. Tabs are legal inside
// a single-quoted string, so they pass through untouched.
export function quoteSingle(value: string): string {
  return `'${value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')}'`
}

// Every escape quoteSingle can emit must decode back to the same character, or
// the pair silently corrupts data on round-trip.
const ESCAPES: Record<string, string> = { n: '\n', r: '\r', t: '\t' }

export function decodeStringLiteral(raw: string): string {
  const trimmed = raw.trim()
  const q = trimmed[0] // opening quote char
  if ((q === "'" || q === '"' || q === '`') && trimmed.endsWith(q) && trimmed.length >= 2) {
    const inner = trimmed.slice(1, -1)
    let out = ''
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '\\' && i + 1 < inner.length) {
        const next = inner[i + 1]
        // A recognized escape maps to its character; anything else (\\ , \') is
        // the backslash taking the next char literally.
        out += ESCAPES[next] ?? next
        i++
      } else {
        out += inner[i]
      }
    }
    return out
  }
  return trimmed
}

// Find the index just past the `{` that opens the header object, and the index
// of its matching `}` — string-aware so braces inside strings don't count.
function findHeaderBraces(content: string): { open: number; close: number } {
  const m = content.match(HEADER_RE)
  if (!m || m.index === undefined) {
    throw new Error('Could not find `export const header = {` in MDX file')
  }
  const open = content.indexOf('{', m.index)
  let depth = 0
  let inString: string | null = null
  for (let i = open; i < content.length; i++) {
    const ch = content[i]
    if (inString) {
      if (ch === inString && !isEscapedAt(content, i)) inString = null
      continue
    }
    if (ch === '/' && content[i + 1] === '/') {
      i += 2
      while (i < content.length && content[i] !== '\n') i++
      continue
    }
    if (ch === '/' && content[i + 1] === '*') {
      i += 2
      while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) i++
      i += 1 // sits on '*'; the for-loop's i++ moves past the '/'
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = ch
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return { open, close: i }
    }
  }
  throw new Error('Unterminated header object in MDX file')
}

// Remove JS // line comments and /* block comments */ from a string while
// respecting string literals so slashes inside strings are not treated as
// comment openers.
function stripComments(s: string): string {
  let out = ''
  let inString: string | null = null
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inString) {
      out += ch
      if (ch === inString && !isEscapedAt(s, i)) inString = null
      continue
    }
    if (ch === '/' && s[i + 1] === '/') {
      i += 2
      while (i < s.length && s[i] !== '\n') i++
      // Keep the newline so surrounding whitespace-trimming still works.
      if (i < s.length) out += s[i]
      continue
    }
    if (ch === '/' && s[i + 1] === '*') {
      i += 2
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) i++
      i += 1 // skip past closing '/'
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') inString = ch
    out += ch
  }
  return out
}

// Split the inner text of the header object into entries at top-level commas,
// string/brace/bracket-aware.
function splitEntries(inner: string): HeaderEntry[] {
  const entries: HeaderEntry[] = []
  let depth = 0
  let inString: string | null = null
  let start = 0
  const pieces: string[] = []
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    if (inString) {
      if (ch === inString && !isEscapedAt(inner, i)) inString = null
      continue
    }
    if (ch === '/' && inner[i + 1] === '/') {
      i += 2
      while (i < inner.length && inner[i] !== '\n') i++
      continue
    }
    if (ch === '/' && inner[i + 1] === '*') {
      i += 2
      while (i < inner.length && !(inner[i] === '*' && inner[i + 1] === '/')) i++
      i += 1 // sits on '*'; the for-loop's i++ moves past the '/'
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') inString = ch
    else if (ch === '{' || ch === '[' || ch === '(') depth++
    else if (ch === '}' || ch === ']' || ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      pieces.push(inner.slice(start, i))
      start = i + 1
    }
  }
  pieces.push(inner.slice(start))

  for (const piece of pieces) {
    // Strip JS comments before processing so that comment lines (e.g. a `//`
    // comment that contains an apostrophe) don't interfere with key detection.
    const clean = stripComments(piece)
    if (!clean.trim()) continue
    // Split at the first top-level colon.
    let ci = -1
    let d = 0
    let s: string | null = null
    for (let i = 0; i < clean.length; i++) {
      const ch = clean[i]
      if (s) {
        if (ch === s && !isEscapedAt(clean, i)) s = null
        continue
      }
      if (ch === "'" || ch === '"' || ch === '`') s = ch
      else if (ch === '{' || ch === '[' || ch === '(') d++
      else if (ch === '}' || ch === ']' || ch === ')') d--
      else if (ch === ':' && d === 0) {
        ci = i
        break
      }
    }
    if (ci === -1) continue
    const rawKey = clean.slice(0, ci).trim()
    const key =
      rawKey.startsWith("'") || rawKey.startsWith('"')
        ? decodeStringLiteral(rawKey)
        : rawKey
    const rawValue = clean.slice(ci + 1).trim()
    entries.push({ key, rawValue })
  }
  return entries
}

export function parseMdxFile(content: string): ParsedMdx {
  const { open, close } = findHeaderBraces(content)
  const m = content.match(HEADER_RE)!
  const preamble = content.slice(0, m.index)
  const inner = content.slice(open + 1, close)
  const body = content.slice(close + 1)
  return { preamble, headerEntries: splitEntries(inner), body }
}

export function serializeMdxFile(parsed: ParsedMdx): string {
  const lines = parsed.headerEntries
    .map((e) => `  ${e.key}: ${e.rawValue},\n`)
    .join('')
  return `${parsed.preamble}export const header = {\n${lines}}${parsed.body}`
}

// Read a single header field's decoded string value (or '' if absent). Used to
// surface non-owned fields like `standardSiteUri` without treating them as
// editable.
export function getHeaderField(parsed: ParsedMdx, key: string): string {
  const e = parsed.headerEntries.find((x) => x.key === key)
  return e ? decodeStringLiteral(e.rawValue) : ''
}

export function getOwnedFields(parsed: ParsedMdx): OwnedFields {
  const get = (key: string) => getHeaderField(parsed, key)
  return {
    title: get('title'),
    description: get('description'),
    date: get('date'),
    author: get('author'),
    blueskyPostUrl: get('blueskyPostUrl'),
  }
}

export function applyOwnedFields(
  parsed: ParsedMdx,
  owned: OwnedFields,
): ParsedMdx {
  let headerEntries = parsed.headerEntries.map((e) => ({ ...e }))
  for (const key of OWNED_KEYS) {
    const value = owned[key]
    // A cleared optional key is deleted outright rather than written empty.
    // Whitespace-only counts as cleared too: bskyPostUrl.ts validates trimmed,
    // so a value that trims to '' can never parse and must not be written.
    if (OPTIONAL_OWNED_KEYS.has(key) && !value.trim()) {
      headerEntries = headerEntries.filter((e) => e.key !== key)
      continue
    }
    const rawValue = quoteSingle(value)
    const existing = headerEntries.find((e) => e.key === key)
    if (existing) existing.rawValue = rawValue
    else headerEntries.push({ key, rawValue })
  }
  return { ...parsed, headerEntries }
}

// Guarantee a blank line between the header's closing `}` and the body. MDX
// requires an ESM export to be separated from following prose by a blank line;
// without this, `}This is a post` is invalid and breaks the MDX parser (and the
// site-wide search indexer that parses every .mdx).
export function normalizeBodySeparation(body: string): string {
  return '\n\n' + body.replace(/^\n+/, '')
}

export function newPostMdx(owned: OwnedFields, body: string): string {
  const headerEntries: HeaderEntry[] = OWNED_KEYS.filter(
    (key) => !(OPTIONAL_OWNED_KEYS.has(key) && !owned[key]),
  ).map((key) => ({
    key,
    rawValue: quoteSingle(owned[key]),
  }))
  return serializeMdxFile({
    preamble: '',
    headerEntries,
    body: normalizeBodySeparation(body),
  })
}
