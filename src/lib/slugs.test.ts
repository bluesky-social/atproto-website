import { describe, it, expect } from 'vitest'
import { slugify, dateStamp, episodeSlug } from './slugs.mjs'

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Designing for Uncertainty')).toBe('designing-for-uncertainty')
  })

  it('collapses punctuation runs and trims edge hyphens', () => {
    expect(slugify('“Nothing Is Ever Over”')).toBe('nothing-is-ever-over')
    expect(slugify('A -- B?!')).toBe('a-b')
  })

  it('is empty for empty input', () => {
    expect(slugify('')).toBe('')
  })
})

describe('dateStamp', () => {
  it('formats YYYY-MM-DD in local time', () => {
    // Midday UTC so the calendar day is the same in every plausible TZ.
    expect(dateStamp('2026-07-31T12:00:00.000Z')).toBe('2026-07-31')
  })

  it('zero-pads', () => {
    expect(dateStamp('2026-03-05T12:00:00.000Z')).toBe('2026-03-05')
  })

  it('is empty for a missing or unparseable value', () => {
    expect(dateStamp('')).toBe('')
    expect(dateStamp('nope')).toBe('')
  })
})

describe('episodeSlug', () => {
  it('is date, title, and the first guest', () => {
    expect(
      episodeSlug({
        pubDate: '2026-07-31T21:23:48.929Z',
        title: 'Designing for Uncertainty',
        guests: ['Ethan Marcotte'],
      }),
    ).toBe('2026-07-31-designing-for-uncertainty-ethan-marcotte')
  })

  it('omits the guest segment when there are none', () => {
    expect(
      episodeSlug({
        pubDate: '2026-07-31T12:00:00.000Z',
        title: 'Protocolly Atmoseed',
        guests: [],
      }),
    ).toBe('2026-07-31-protocolly-atmoseed')
  })

  it('uses only the first guest when there are several', () => {
    // Two or three guests would make the slug unreadable; the date and title
    // already identify the episode.
    expect(
      episodeSlug({
        pubDate: '2026-07-31T12:00:00.000Z',
        title: 'In Our Timeline',
        guests: ['Paul Frazee', 'Daniel Holmgren'],
      }),
    ).toBe('2026-07-31-in-our-timeline-paul-frazee')
  })

  it('drops the date segment when the publish date is unusable', () => {
    expect(episodeSlug({ pubDate: '', title: 'No Date', guests: [] })).toBe('no-date')
  })

  it('is empty when there is nothing to build from', () => {
    // The caller shows a placeholder instead of a half-formed slug.
    expect(episodeSlug({ pubDate: '', title: '', guests: [] })).toBe('')
  })

  it('ignores whitespace-only guest entries', () => {
    expect(
      episodeSlug({ pubDate: '2026-07-31T12:00:00.000Z', title: 'T', guests: ['   '] }),
    ).toBe('2026-07-31-t')
  })
})
