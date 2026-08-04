import { describe, it, expect } from 'vitest'
import {
  resolveAuthorDid,
  withAuthor,
  unknownAuthors,
  isValidDid,
  mergeAuthorDids,
  type AuthorMap,
} from './authors'

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

describe('unknownAuthors', () => {
  it('returns only the names the map does not know', () => {
    expect(unknownAuthors(MAP, ['Jim Ray', 'Ethan Marcotte'])).toEqual([
      'Ethan Marcotte',
    ])
  })

  it('is empty when every name is known', () => {
    expect(unknownAuthors(MAP, ['Jim Ray'])).toEqual([])
  })

  // hosts and guests come from comma-separated text fields, so blanks and
  // trailing separators are routine while typing.
  it('ignores empty and whitespace-only names', () => {
    expect(unknownAuthors(MAP, ['', '   ', 'Ethan Marcotte'])).toEqual([
      'Ethan Marcotte',
    ])
  })

  it('reports a repeated unknown name once', () => {
    expect(
      unknownAuthors(MAP, ['Ethan Marcotte', 'Ethan Marcotte']),
    ).toEqual(['Ethan Marcotte'])
  })

  it('preserves the order the names were given in', () => {
    expect(unknownAuthors(MAP, ['B Person', 'Jim Ray', 'A Person'])).toEqual([
      'B Person',
      'A Person',
    ])
  })

  // Matching is exact, like resolveAuthorDid: authors.json keys must equal the
  // name written in the episode header for the byline link to resolve.
  it('treats a differently-cased name as unknown', () => {
    expect(unknownAuthors(MAP, ['jim ray'])).toEqual(['jim ray'])
  })
})

describe('isValidDid', () => {
  it('accepts the DID forms the site uses', () => {
    expect(isValidDid('did:plc:hx35zjisxgynsrwdsrmj2egw')).toBe(true)
    expect(isValidDid('did:web:api.sprk.so')).toBe(true)
  })

  it('rejects anything that is not a DID', () => {
    expect(isValidDid('')).toBe(false)
    expect(isValidDid('hx35zjisxgynsrwdsrmj2egw')).toBe(false)
    expect(isValidDid('did:plc:')).toBe(false)
    expect(isValidDid('did:plc')).toBe(false)
    expect(isValidDid('https://bsky.app/profile/jimray.net')).toBe(false)
  })

  // Pasting from a browser is the likely input path, so trailing space and a
  // stray newline must not produce a broken profile link.
  it('rejects surrounding whitespace rather than silently trimming', () => {
    expect(isValidDid(' did:plc:abc')).toBe(false)
    expect(isValidDid('did:plc:abc\n')).toBe(false)
  })
})

describe('mergeAuthorDids', () => {
  it('adds new names without mutating the input', () => {
    const out = mergeAuthorDids(MAP, { 'Ethan Marcotte': 'did:plc:ethan' })
    expect(out.map).toEqual({
      'Jim Ray': 'did:plc:jim',
      'Ethan Marcotte': 'did:plc:ethan',
    })
    expect(MAP['Ethan Marcotte']).toBeUndefined()
  })

  it('adds several at once', () => {
    const out = mergeAuthorDids(MAP, { A: 'did:plc:a', B: 'did:plc:b' })
    expect(out.map.A).toBe('did:plc:a')
    expect(out.map.B).toBe('did:plc:b')
  })

  // A name already in authors.json is left alone: the stored DID is the one the
  // site has been linking to, and a form shouldn't quietly repoint it.
  it('never overwrites a DID that is already recorded', () => {
    const out = mergeAuthorDids(MAP, { 'Jim Ray': 'did:plc:someone-else' })
    expect(out.map['Jim Ray']).toBe('did:plc:jim')
  })

  it('skips a malformed DID and names it, rather than writing junk', () => {
    const out = mergeAuthorDids(MAP, { 'Ethan Marcotte': 'not-a-did' })
    expect(out.map['Ethan Marcotte']).toBeUndefined()
    expect(out.rejected).toEqual(['Ethan Marcotte'])
  })

  it('skips a blank DID without complaining', () => {
    // An empty input just means "I don't have it yet", not an error.
    const out = mergeAuthorDids(MAP, { 'Ethan Marcotte': '   ' })
    expect(out.map).toEqual(MAP)
    expect(out.rejected).toEqual([])
  })

  it('reports whether anything actually changed', () => {
    expect(mergeAuthorDids(MAP, {}).changed).toBe(false)
    expect(mergeAuthorDids(MAP, { A: 'did:plc:a' }).changed).toBe(true)
    expect(mergeAuthorDids(MAP, { 'Jim Ray': 'did:plc:dupe' }).changed).toBe(false)
  })
})
