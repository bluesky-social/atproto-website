import { describe, it, expect } from 'vitest'
import {
  hasEntry,
  prependEntry,
  updateEntryBySlug,
  removeEntryBySlug,
  type EpisodeEntry,
} from './episodesFile'

const SRC = `export interface Episode { slug: string }

export const episodes: Episode[] = [
  {
    slug: 'ep-one',
    episodeNumber: 1,
    title: 'One',
    description: 'first',
    date: 'May 1, 2026',
    pubDate: '2026-05-01T00:00:00.000Z',
    duration: '00:10:00',
    durationSeconds: 600,
    audioUrl: 'https://media/x.mp3',
    audioSizeBytes: 10,
    audioMimeType: 'audio/mpeg',
  },
]
`

const ENTRY: EpisodeEntry = {
  slug: 'ep-two',
  episodeNumber: 2,
  title: "Two's Day",
  description: 'second',
  date: 'May 8, 2026',
  pubDate: '2026-05-08T00:00:00.000Z',
  duration: '00:12:00',
  durationSeconds: 720,
  guests: ['Ada'],
  format: 'conversation',
  audioUrl: 'https://media/y.mp3',
  audioSizeBytes: 20,
  audioMimeType: 'audio/mpeg',
  explicit: false,
  blueskyPostUrl: '',
}

describe('prependEntry', () => {
  it('inserts a typed entry at the top with no hosts field', () => {
    const out = prependEntry(SRC, ENTRY)
    expect(out.indexOf("slug: 'ep-two'")).toBeLessThan(out.indexOf("slug: 'ep-one'"))
    expect(out).toContain('episodeNumber: 2,')
    expect(out).toContain("title: 'Two\\'s Day',")
    expect(out).toContain("guests: ['Ada'],")
    expect(out).not.toContain('hosts:')
    expect(out).not.toContain('explicit:') // false omitted
    expect(out).not.toContain('blueskyPostUrl:') // empty omitted
  })
  it('renders format after guests and before audioUrl', () => {
    const out = prependEntry(SRC, { ...ENTRY, format: 'livestream' })
    expect(out).toContain("format: 'livestream',")
    expect(out.indexOf("guests: ['Ada']")).toBeLessThan(out.indexOf("format: 'livestream'"))
    expect(out.indexOf("format: 'livestream'")).toBeLessThan(out.indexOf('audioUrl:'))
  })

  it('renders format even when there are no guests', () => {
    const out = prependEntry(SRC, { ...ENTRY, guests: [], format: 'livestream' })
    expect(out).toContain("format: 'livestream',")
  })

  it('throws when the anchor is missing', () => {
    expect(() => prependEntry('const x = []\n', ENTRY)).toThrow(/anchor/i)
  })

  // A raw newline would split the literal across two lines and make episodes.ts
  // unparseable, so every rendered value has to stay on its own line.
  it('escapes newlines in a multi-line description', () => {
    const out = prependEntry(SRC, { ...ENTRY, description: 'first\nsecond' })
    expect(out).toContain("description: 'first\\nsecond',")
  })
})

describe('updateEntryBySlug', () => {
  it('replaces the matching entry', () => {
    const out = updateEntryBySlug(SRC, 'ep-one', { ...ENTRY, slug: 'ep-one', title: 'One (edited)' })
    expect(out).toContain("title: 'One (edited)'")
    expect(out).not.toContain("title: 'One',")
  })
  it('throws when the slug is absent', () => {
    expect(() => updateEntryBySlug(SRC, 'nope', ENTRY)).toThrow(/not found/i)
  })
})

describe('removeEntryBySlug', () => {
  it('removes the entry', () => {
    expect(hasEntry(removeEntryBySlug(SRC, 'ep-one'), 'ep-one')).toBe(false)
  })
  it('is a no-op when absent', () => {
    expect(removeEntryBySlug(SRC, 'nope')).toBe(SRC)
  })
})
