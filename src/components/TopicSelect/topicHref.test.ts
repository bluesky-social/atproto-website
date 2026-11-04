import { describe, expect, it } from 'vitest'
import { topicSelectHref } from './topicHref'

describe('topicSelectHref', () => {
  it('goes to the topic page for a known topic', () => {
    expect(topicSelectHref('feeds')).toBe('/blog/topic/feeds')
  })

  it('goes to the full listing for the "All topics" option', () => {
    expect(topicSelectHref('')).toBe('/blog')
  })

  it('goes to the full listing for an unknown or missing topic', () => {
    expect(topicSelectHref('not-a-topic')).toBe('/blog')
    expect(topicSelectHref(null)).toBe('/blog')
  })

  it('does not build a path from untrusted input', () => {
    expect(topicSelectHref('../../evil')).toBe('/blog')
  })
})
