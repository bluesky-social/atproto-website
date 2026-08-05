import { describe, it, expect } from 'vitest'
import {
  EPISODE_FORMATS,
  FORMAT_LABELS,
  DEFAULT_EPISODE_FORMAT,
  toEpisodeFormat,
  FILTER_ORDER,
  FILTER_LABELS,
  toFormatFilter,
  FORMAT_DIR_TOKENS,
} from './episodeFormat.mjs'

describe('EPISODE_FORMATS', () => {
  // Pinned deliberately. The union is a hand-written JSDoc @typedef, because
  // `as const` isn't valid JS — so nothing stops the array and the type from
  // drifting apart except this test.
  it('is exactly the three supported formats, in display order', () => {
    expect(EPISODE_FORMATS).toEqual(['conversation', 'livestream', 'ama'])
  })

  it('gives every format a label', () => {
    for (const format of EPISODE_FORMATS) {
      expect(FORMAT_LABELS[format], format).toBeTruthy()
    }
  })

  it('has no label for a format that does not exist', () => {
    expect(Object.keys(FORMAT_LABELS).sort()).toEqual([...EPISODE_FORMATS].sort())
  })

  it('defaults to conversation, the show’s most common mode', () => {
    expect(DEFAULT_EPISODE_FORMAT).toBe('conversation')
    expect(EPISODE_FORMATS).toContain(DEFAULT_EPISODE_FORMAT)
  })
})

describe('toEpisodeFormat', () => {
  it('passes through each supported format', () => {
    for (const format of EPISODE_FORMATS) {
      expect(toEpisodeFormat(format)).toBe(format)
    }
  })

  // An en.mdx written before this field existed, or by hand.
  it('falls back to the default when the value is absent', () => {
    expect(toEpisodeFormat('')).toBe('conversation')
  })

  it('falls back to the default for an unrecognized value', () => {
    expect(toEpisodeFormat('livestrem')).toBe('conversation')
  })

  // Exact match only: the only writers are the studio and the CLI, which emit
  // canonical lowercase. Accepting near-misses means deciding how near is near
  // enough, and a wrong badge is visible and cheap.
  it('does not coerce differing case or surrounding space', () => {
    expect(toEpisodeFormat('Livestream')).toBe('conversation')
    expect(toEpisodeFormat(' livestream')).toBe('conversation')
  })
})

describe('FORMAT_LABELS copy', () => {
  // Pinned because these are the words on the page. "Recorded Live" rather than
  // "Livestream": the episode is a recording of a stream, not a live stream.
  it('reads the way the show refers to each format', () => {
    expect(FORMAT_LABELS).toEqual({
      conversation: 'Conversation',
      livestream: 'Recorded Live',
      ama: 'AMA',
    })
  })
})

describe('FILTER_ORDER', () => {
  // Deliberately not EPISODE_FORMATS order — this is the order the filter reads
  // in, which Jim specified as All, Live Recordings, AMAs, Conversations.
  it('leads with all, then every format exactly once', () => {
    expect(FILTER_ORDER).toEqual(['all', 'livestream', 'ama', 'conversation'])
    expect([...FILTER_ORDER].slice(1).sort()).toEqual([...EPISODE_FORMATS].sort())
  })

  it('labels every entry', () => {
    for (const key of FILTER_ORDER) {
      expect(FILTER_LABELS[key], key).toBeTruthy()
    }
  })

  it('uses plural labels, since each names a set of episodes', () => {
    expect(FILTER_LABELS).toEqual({
      all: 'All',
      livestream: 'Live Recordings',
      ama: 'AMAs',
      conversation: 'Conversations',
    })
  })
})

describe('toFormatFilter', () => {
  it('passes through each format', () => {
    for (const format of EPISODE_FORMATS) {
      expect(toFormatFilter(format)).toBe(format)
    }
  })

  // An absent ?show= is the unfiltered listing.
  it('treats absent as all', () => {
    expect(toFormatFilter('')).toBe('all')
    expect(toFormatFilter(undefined)).toBe('all')
  })

  it('treats an unknown or hand-edited value as all rather than showing nothing', () => {
    expect(toFormatFilter('livestrem')).toBe('all')
    expect(toFormatFilter('Livestream')).toBe('all')
    expect(toFormatFilter('solo')).toBe('all')
  })

  it('accepts an explicit all', () => {
    expect(toFormatFilter('all')).toBe('all')
  })
})

describe('FORMAT_DIR_TOKENS', () => {
  // Used for the R2 folder when an episode has no guest to name it after.
  // 'live' rather than 'livestream' because the bucket already has
  // 2026-07-08-live, 2026-06-10-live and 2026-05-29-live.
  it('matches the folder names already in the bucket', () => {
    expect(FORMAT_DIR_TOKENS).toEqual({
      conversation: 'conversation',
      livestream: 'live',
      ama: 'ama',
    })
  })

  it('has a token for every format', () => {
    for (const format of EPISODE_FORMATS) {
      expect(FORMAT_DIR_TOKENS[format], format).toBeTruthy()
    }
  })
})
