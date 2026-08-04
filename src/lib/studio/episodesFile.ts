import { quoteSingle } from './mdxHeader'
import type { EpisodeFormat } from '@/lib/episodeFormat.mjs'

export type EpisodeEntry = {
  slug: string
  episodeNumber: number
  title: string
  description: string
  date: string
  pubDate: string
  duration: string
  durationSeconds: number
  guests: string[]
  format: EpisodeFormat
  audioUrl: string
  audioSizeBytes: number
  audioMimeType: string
  explicit: boolean
  blueskyPostUrl: string
}

const ANCHOR = 'export const episodes: Episode[] = ['

// One escaping implementation for every generated single-quoted literal; see
// quoteSingle for why newlines matter.
const q = quoteSingle

function arr(items: string[]): string {
  return `[${items.map(q).join(', ')}]`
}

function renderEntry(e: EpisodeEntry): string {
  const lines = [
    `  {`,
    `    slug: ${q(e.slug)},`,
    `    episodeNumber: ${e.episodeNumber},`,
    `    title: ${q(e.title)},`,
    `    description: ${q(e.description)},`,
    `    date: ${q(e.date)},`,
    `    pubDate: ${q(e.pubDate)},`,
    `    duration: ${q(e.duration)},`,
    `    durationSeconds: ${e.durationSeconds},`,
  ]
  if (e.guests.length) lines.push(`    guests: ${arr(e.guests)},`)
  lines.push(`    format: ${q(e.format)},`)
  lines.push(`    audioUrl: ${q(e.audioUrl)},`)
  lines.push(`    audioSizeBytes: ${e.audioSizeBytes},`)
  lines.push(`    audioMimeType: ${q(e.audioMimeType)},`)
  if (e.explicit) lines.push(`    explicit: true,`)
  if (e.blueskyPostUrl) lines.push(`    blueskyPostUrl: ${q(e.blueskyPostUrl)},`)
  lines.push(`  },`)
  return lines.join('\n')
}

function entryRegex(slug: string): RegExp {
  const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\n? *\\{[^{}]*slug:\\s*'${escaped}'[^{}]*\\},?`, 's')
}

export function hasEntry(source: string, slug: string): boolean {
  return entryRegex(slug).test(source)
}

export function prependEntry(source: string, entry: EpisodeEntry): string {
  if (!source.includes(ANCHOR)) {
    throw new Error(`Could not find episodes array anchor: ${ANCHOR}`)
  }
  return source.replace(ANCHOR, `${ANCHOR}\n${renderEntry(entry)}`)
}

export function updateEntryBySlug(
  source: string,
  slug: string,
  entry: EpisodeEntry,
): string {
  const re = entryRegex(slug)
  if (!re.test(source)) throw new Error(`Episode entry not found for slug: ${slug}`)
  return source.replace(re, `\n${renderEntry(entry)}`)
}

export function removeEntryBySlug(source: string, slug: string): string {
  const re = entryRegex(slug)
  if (!re.test(source)) return source
  return source.replace(re, '')
}
