import { describe, expect, it } from 'vitest'
import { resolveHosts, SHOW } from './episodes'

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
