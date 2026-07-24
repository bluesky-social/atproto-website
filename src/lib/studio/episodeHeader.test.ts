import { describe, it, expect } from 'vitest'
import { parseMdxFile } from './mdxHeader'
import {
  newEpisodeMdx,
  getEpisodeFields,
  applyEpisodeFields,
  type EpisodeFields,
} from './episodeHeader'

const FIELDS: EpisodeFields = {
  episodeNumber: 12,
  title: "It's Live",
  description: 'A test episode',
  date: 'July 10, 2026',
  pubDate: '2026-07-10T00:00:00.000Z',
  hosts: ['Jim Ray'],
  duration: '00:20:00',
  durationSeconds: 1200,
  guests: ['Ada L'],
  audioUrl: 'https://media.atproto.com/off-protocol/x/x.mp3',
  audioSizeBytes: 123,
  audioMimeType: 'audio/mpeg',
  hasShowNotes: true,
  hasTranscript: false,
  explicit: false,
  blueskyPostUrl: '',
}

describe('newEpisodeMdx', () => {
  it('emits typed literals, omits empty optionals, separates body', () => {
    const out = newEpisodeMdx(FIELDS, 'Show notes here.')
    expect(out).toContain('episodeNumber: 12,')
    expect(out).toContain("title: 'It\\'s Live',")
    expect(out).toContain("hosts: ['Jim Ray'],")
    expect(out).toContain("guests: ['Ada L'],")
    expect(out).toContain('durationSeconds: 1200,')
    expect(out).toContain('hasShowNotes: true,')
    expect(out).toContain('hasTranscript: false,')
    expect(out).not.toContain('explicit:') // false → omitted
    expect(out).not.toContain('blueskyPostUrl:') // empty → omitted
    expect(out).toContain('}\n\nShow notes here.')
  })
})

describe('empty hosts', () => {
  it('omits the hosts key so the page falls back to the default host', () => {
    const out = newEpisodeMdx({ ...FIELDS, hosts: [] }, 'body')
    expect(out).not.toContain('hosts:')
  })
})

describe('round-trip', () => {
  it('getEpisodeFields decodes what newEpisodeMdx wrote', () => {
    const parsed = parseMdxFile(newEpisodeMdx(FIELDS, 'body'))
    expect(getEpisodeFields(parsed)).toEqual(FIELDS)
  })

  it('applyEpisodeFields preserves unknown header keys', () => {
    const withExtra = newEpisodeMdx(FIELDS, 'body').replace(
      'export const header = {\n',
      "export const header = {\n  coverImage: 'https://x/c.png',\n",
    )
    const parsed = parseMdxFile(withExtra)
    const next = applyEpisodeFields(parsed, { ...FIELDS, title: 'Renamed' })
    const out = next.headerEntries.map((e) => `${e.key}:${e.rawValue}`).join('|')
    expect(out).toContain("title:'Renamed'")
    expect(out).toContain("coverImage:'https://x/c.png'")
  })
})
