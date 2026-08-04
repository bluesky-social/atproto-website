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
    expect(episodes.length).toBeGreaterThanOrEqual(14)
  })

  // Deliberately NOT asserting which episodes are which format. Two tests here
  // used to pin livestreams to [5, 7, 8, 11, 13] and the AMA to [10], which was
  // only ever a snapshot of the backfill's guesses — it failed the first time
  // Jim recategorised early episodes that turned out to be livestreams with
  // guests. Which format an episode is is an editorial call, not an invariant,
  // and a test that breaks on a correct edit is worse than no test.
  //
  // What *is* an invariant: episodeNumber must be unique, because the RSS GUID
  // is `off-protocol-ep-${episodeNumber}`. Two episodes sharing a number would
  // publish two feed items with the same GUID, and podcatchers would treat the
  // second as a duplicate of the first and silently drop it.
  it('gives every episode a unique episodeNumber', () => {
    const numbers = episodes.map((e) => e.episodeNumber)
    expect(new Set(numbers).size, `duplicate in ${numbers.join(', ')}`).toBe(
      numbers.length,
    )
  })
})
