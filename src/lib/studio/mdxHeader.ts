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
}

export const OWNED_KEYS = ['title', 'description', 'date', 'author'] as const

const HEADER_RE = /export\s+const\s+header\s*=\s*\{/

// A quote closes a string only when preceded by an even number of consecutive
// backslashes; an odd count means the quote itself is escaped.
function isEscapedAt(s: string, i: number): boolean {
  let n = 0
  for (let j = i - 1; j >= 0 && s[j] === '\\'; j--) n++
  return n % 2 === 1
}

export function quoteSingle(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

export function decodeStringLiteral(raw: string): string {
  const trimmed = raw.trim()
  const q = trimmed[0] // opening quote char
  if ((q === "'" || q === '"' || q === '`') && trimmed.endsWith(q) && trimmed.length >= 2) {
    const inner = trimmed.slice(1, -1)
    let out = ''
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '\\' && i + 1 < inner.length) {
        out += inner[i + 1] // unescape: backslash takes the next char literally
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
    if (!piece.trim()) continue
    // Split at the first top-level colon.
    let ci = -1
    let d = 0
    let s: string | null = null
    for (let i = 0; i < piece.length; i++) {
      const ch = piece[i]
      if (s) {
        if (ch === s && !isEscapedAt(piece, i)) s = null
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
    const rawKey = piece.slice(0, ci).trim()
    const key =
      rawKey.startsWith("'") || rawKey.startsWith('"')
        ? decodeStringLiteral(rawKey)
        : rawKey
    const rawValue = piece.slice(ci + 1).trim()
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
  }
}

export function applyOwnedFields(
  parsed: ParsedMdx,
  owned: OwnedFields,
): ParsedMdx {
  const headerEntries = parsed.headerEntries.map((e) => ({ ...e }))
  for (const key of OWNED_KEYS) {
    const rawValue = quoteSingle(owned[key])
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
  const headerEntries: HeaderEntry[] = OWNED_KEYS.map((key) => ({
    key,
    rawValue: quoteSingle(owned[key]),
  }))
  return serializeMdxFile({
    preamble: '',
    headerEntries,
    body: normalizeBodySeparation(body),
  })
}
