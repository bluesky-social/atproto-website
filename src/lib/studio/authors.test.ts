import { describe, it, expect } from 'vitest'
import { resolveAuthorDid, withAuthor, type AuthorMap } from './authors'

const MAP: AuthorMap = { 'Jim Ray': 'did:plc:jim' }

describe('resolveAuthorDid', () => {
  it('returns the DID for a known author', () => {
    expect(resolveAuthorDid(MAP, 'Jim Ray')).toBe('did:plc:jim')
  })
  it('returns null for an unknown author', () => {
    expect(resolveAuthorDid(MAP, 'Nobody')).toBeNull()
  })
})

describe('withAuthor', () => {
  it('adds a new author without mutating the input', () => {
    const out = withAuthor(MAP, 'New Person', 'did:plc:new')
    expect(out).toEqual({ 'Jim Ray': 'did:plc:jim', 'New Person': 'did:plc:new' })
    expect(MAP['New Person']).toBeUndefined()
  })
})
