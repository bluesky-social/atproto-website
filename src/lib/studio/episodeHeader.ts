import {
  serializeMdxFile,
  normalizeBodySeparation,
  decodeStringLiteral,
  quoteSingle,
  type ParsedMdx,
  type HeaderEntry,
} from './mdxHeader'
import { toEpisodeFormat, type EpisodeFormat } from '@/lib/episodeFormat.mjs'

export type EpisodeFields = {
  episodeNumber: number
  title: string
  description: string
  date: string
  pubDate: string
  hosts: string[]
  duration: string
  durationSeconds: number
  guests: string[]
  format: EpisodeFormat
  audioUrl: string
  audioSizeBytes: number
  audioMimeType: string
  hasShowNotes: boolean
  hasTranscript: boolean
  explicit: boolean
  blueskyPostUrl: string
}

// Canonical emit order (matches existing episodes; optionals interleaved).
const KEY_ORDER = [
  'episodeNumber',
  'title',
  'description',
  'date',
  'pubDate',
  'hosts',
  'duration',
  'durationSeconds',
  'guests',
  'format',
  'audioUrl',
  'audioSizeBytes',
  'audioMimeType',
  'hasShowNotes',
  'hasTranscript',
  'explicit',
  'blueskyPostUrl',
] as const

const MANAGED = new Set<string>(KEY_ORDER)

function arrayLiteral(items: string[]): string {
  return `[${items.map((s) => quoteSingle(s)).join(', ')}]`
}

function parseArrayLiteral(raw: string): string[] {
  const inner = raw.trim().replace(/^\[/, '').replace(/\]$/, '').trim()
  if (!inner) return []
  // Split on top-level commas (values are simple quoted strings).
  const parts: string[] = []
  let depth = 0
  let s: string | null = null
  let start = 0
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]
    const prev = inner[i - 1]
    if (s) {
      if (ch === s && prev !== '\\') s = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') s = ch
    else if (ch === '[') depth++
    else if (ch === ']') depth--
    else if (ch === ',' && depth === 0) {
      parts.push(inner.slice(start, i))
      start = i + 1
    }
  }
  parts.push(inner.slice(start))
  return parts.map((p) => decodeStringLiteral(p.trim())).filter((v) => v !== '')
}

// Build header entries in canonical order, omitting empty optionals, then
// append any unmanaged keys from `preserved` (e.g. coverImage, future fields).
function buildEntries(
  fields: EpisodeFields,
  preserved: HeaderEntry[] = [],
): HeaderEntry[] {
  const entries: HeaderEntry[] = []
  const push = (key: string, rawValue: string) => entries.push({ key, rawValue })

  push('episodeNumber', String(fields.episodeNumber))
  push('title', quoteSingle(fields.title))
  push('description', quoteSingle(fields.description))
  push('date', quoteSingle(fields.date))
  push('pubDate', quoteSingle(fields.pubDate))
  // Omitted when empty so the page falls back to SHOW.defaultHost, matching
  // the episodes that never set hosts by hand.
  if (fields.hosts.length) push('hosts', arrayLiteral(fields.hosts))
  push('duration', quoteSingle(fields.duration))
  push('durationSeconds', String(fields.durationSeconds))
  if (fields.guests.length) push('guests', arrayLiteral(fields.guests))
  // Always emitted, including for a conversation: the listing badges every
  // episode, so an implicit value would be indistinguishable from an unlabelled
  // one.
  push('format', quoteSingle(fields.format))
  push('audioUrl', quoteSingle(fields.audioUrl))
  push('audioSizeBytes', String(fields.audioSizeBytes))
  push('audioMimeType', quoteSingle(fields.audioMimeType))
  push('hasShowNotes', String(fields.hasShowNotes))
  push('hasTranscript', String(fields.hasTranscript))
  if (fields.explicit) push('explicit', 'true')
  if (fields.blueskyPostUrl) push('blueskyPostUrl', quoteSingle(fields.blueskyPostUrl))

  for (const e of preserved) {
    if (!MANAGED.has(e.key)) entries.push({ ...e })
  }
  return entries
}

export function newEpisodeMdx(fields: EpisodeFields, body: string): string {
  return serializeMdxFile({
    preamble: '',
    headerEntries: buildEntries(fields),
    body: normalizeBodySeparation(body),
  })
}

export function applyEpisodeFields(
  parsed: ParsedMdx,
  fields: EpisodeFields,
): ParsedMdx {
  return { ...parsed, headerEntries: buildEntries(fields, parsed.headerEntries) }
}

export function getEpisodeFields(parsed: ParsedMdx): EpisodeFields {
  const raw = (key: string) =>
    parsed.headerEntries.find((e) => e.key === key)?.rawValue
  const str = (key: string) => {
    const r = raw(key)
    return r === undefined ? '' : decodeStringLiteral(r)
  }
  const num = (key: string) => {
    const r = raw(key)
    return r === undefined ? 0 : Number(r)
  }
  const bool = (key: string) => raw(key)?.trim() === 'true'
  const arr = (key: string) => {
    const r = raw(key)
    return r === undefined ? [] : parseArrayLiteral(r)
  }
  return {
    episodeNumber: num('episodeNumber'),
    title: str('title'),
    description: str('description'),
    date: str('date'),
    pubDate: str('pubDate'),
    hosts: arr('hosts'),
    duration: str('duration'),
    durationSeconds: num('durationSeconds'),
    guests: arr('guests'),
    format: toEpisodeFormat(str('format')),
    audioUrl: str('audioUrl'),
    audioSizeBytes: num('audioSizeBytes'),
    audioMimeType: str('audioMimeType') || 'audio/mpeg',
    hasShowNotes: bool('hasShowNotes'),
    hasTranscript: bool('hasTranscript'),
    explicit: bool('explicit'),
    blueskyPostUrl: str('blueskyPostUrl'),
  }
}
