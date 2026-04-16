import { describe, expect, it } from 'vitest'
import { encodeAudDid, isValidNsid, isPartialWildcard } from './scopeUtils'

describe('encodeAudDid', () => {
  it('percent-encodes # as %23 in service fragment', () => {
    expect(encodeAudDid('did:web:api.bsky.app#bsky_appview')).toBe(
      'did:web:api.bsky.app%23bsky_appview',
    )
  })

  it('leaves a DID without fragment untouched', () => {
    expect(encodeAudDid('did:web:api.example.com')).toBe('did:web:api.example.com')
  })

  it('returns the wildcard `*` untouched', () => {
    expect(encodeAudDid('*')).toBe('*')
  })

  it('returns empty string untouched', () => {
    expect(encodeAudDid('')).toBe('')
  })
})

describe('isValidNsid', () => {
  it('accepts a canonical reverse-domain NSID', () => {
    expect(isValidNsid('app.bsky.feed.post')).toBe(true)
  })
  it('accepts NSID with numbers in segments', () => {
    expect(isValidNsid('com.example.v2.post')).toBe(true)
  })
  it('rejects single-segment strings', () => {
    expect(isValidNsid('post')).toBe(false)
  })
  it('rejects trailing dot', () => {
    expect(isValidNsid('app.bsky.')).toBe(false)
  })
  it('rejects uppercase segments', () => {
    expect(isValidNsid('App.Bsky.Feed.Post')).toBe(false)
  })
  it('rejects empty string', () => {
    expect(isValidNsid('')).toBe(false)
  })
})

describe('isPartialWildcard', () => {
  it('flags partial wildcards like app.bsky.*', () => {
    expect(isPartialWildcard('app.bsky.*')).toBe(true)
  })
  it('flags partial wildcards like *.feed.post', () => {
    expect(isPartialWildcard('*.feed.post')).toBe(true)
  })
  it('does NOT flag the bare wildcard `*`', () => {
    expect(isPartialWildcard('*')).toBe(false)
  })
  it('does NOT flag a valid NSID', () => {
    expect(isPartialWildcard('app.bsky.feed.post')).toBe(false)
  })
})
