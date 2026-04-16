import { describe, expect, it } from 'vitest'
import { encodeAudDid } from './scopeUtils'

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
