import { describe, expect, it } from 'vitest'
import { resolveHosts, SHOW, episodes } from './episodes'
import { EPISODE_FORMATS } from './episodeFormat.mjs'

describe('resolveHosts', () => {
  it('returns the episode hosts when they are set', () => {
    expect(resolveHosts({ hosts: ['Paul Frazee', 'Daniel Holmgren'] })).toEqual(
      ['Paul Frazee', 'Daniel Holmgren'],
    )
  })

  it("defaults to ['Jim Ray'] when hosts is omitted", () => {
    expect(resolveHosts({})).toEqual(['Jim Ray'])
  })

  it('falls back to the default host when hosts is an empty array', () => {
    // The studio writes `hosts` from a form field that can be cleared; an
    // empty array must not blank out the byline.
    expect(resolveHosts({ hosts: [] })).toEqual(['Jim Ray'])
  })

  it('uses the show default host for the fallback', () => {
    expect(SHOW.defaultHost).toBe('Jim Ray')
    expect(resolveHosts({})).toEqual([SHOW.defaultHost])
  })
})

describe('episode format data', () => {
  // The listing badges every episode. This is what makes that an enforced
  // invariant rather than an intention, and it catches an incomplete backfill.
  it('gives every episode a recognized format', () => {
    for (const episode of episodes) {
      expect(
        EPISODE_FORMATS,
        `ep ${episode.episodeNumber} (${episode.slug})`,
      ).toContain(episode.format)
    }
  })

  it('covers the whole catalogue', () => {
    expect(episodes.length).toBeGreaterThanOrEqual(13)
  })

  it('has the recorded livestreams labelled', () => {
    const livestreams = episodes
      .filter((e) => e.format === 'livestream')
      .map((e) => e.episodeNumber)
      .sort((a, b) => a - b)
    expect(livestreams).toEqual([5, 7, 8, 11, 13])
  })

  it('has the AMA labelled', () => {
    expect(
      episodes.filter((e) => e.format === 'ama').map((e) => e.episodeNumber),
    ).toEqual([10])
  })
})
