// scripts/lib/readEpisodeHeader.mjs
//
// Reads the few episode header fields the transcribe script needs, in plain
// JS. The site's full parser (src/lib/studio/episodeHeader.ts) is TypeScript
// and needs tsx, which can't run on the Mac while node_modules is installed
// from the Linux VM. A contract test keeps the two in agreement.

const HEADER_RE = /export\s+const\s+header\s*=\s*\{/
const ESCAPES = { n: '\n', r: '\r', t: '\t' }

// Split on commas outside strings and brackets. Returns [parts, endIndex],
// where endIndex is the position of the closing bracket at depth 0.
function splitTopLevel(src, start) {
  const parts = []
  let depth = 0
  let quote = null
  let from = start
  for (let i = start; i < src.length; i++) {
    const ch = src[i]
    if (quote) {
      if (ch === '\\') i++
      else if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if (ch === '[' || ch === '{') depth++
    else if (ch === ']' || ch === '}') {
      if (depth === 0) {
        parts.push(src.slice(from, i))
        return [parts, i]
      }
      depth--
    } else if (ch === ',' && depth === 0) {
      parts.push(src.slice(from, i))
      from = i + 1
    }
  }
  throw new Error('Unclosed header object')
}

function decodeString(raw) {
  const s = raw.trim()
  const q = s[0]
  if (!(q === "'" || q === '"' || q === '`') || !s.endsWith(q) || s.length < 2)
    return s
  return s.slice(1, -1).replace(/\\(.)/g, (_, c) => ESCAPES[c] ?? c)
}

function decodeArray(raw) {
  const s = raw.trim()
  if (!s.startsWith('[')) return []
  const [parts] = splitTopLevel(s, 1)
  return parts.map(decodeString).filter((v) => v !== '')
}

export function readEpisodeHeader(content) {
  const m = content.match(HEADER_RE)
  if (!m)
    throw new Error('Could not find `export const header = {` in MDX file')
  const [entries] = splitTopLevel(content, m.index + m[0].length)

  const raw = {}
  for (const entry of entries) {
    const kv = entry.match(/^\s*(\w+)\s*:\s*([\s\S]*?)\s*$/)
    if (kv) raw[kv[1]] = kv[2]
  }
  return {
    audioUrl: raw.audioUrl === undefined ? '' : decodeString(raw.audioUrl),
    hosts: raw.hosts === undefined ? [] : decodeArray(raw.hosts),
    guests: raw.guests === undefined ? [] : decodeArray(raw.guests),
    hasTranscript: raw.hasTranscript?.trim() === 'true',
  }
}
