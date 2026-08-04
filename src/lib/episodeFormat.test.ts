import { describe, it, expect } from 'vitest'
import {
  EPISODE_FORMATS,
  FORMAT_LABELS,
  DEFAULT_EPISODE_FORMAT,
  toEpisodeFormat,
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
