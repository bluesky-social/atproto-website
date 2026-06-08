import { describe, it, expect } from 'vitest'
import { parsePermissionSetRef } from './permissionSetResolver'

const DID = 'did:plc:4v4y5r3lwsbtmsxhile2ljac'
const NSID = 'app.bsky.authFullApp'

describe('parsePermissionSetRef', () => {
  it('parses a lexicon.garden link', () => {
    const r = parsePermissionSetRef(`https://lexicon.garden/lexicon/${DID}/${NSID}`)
    expect(r).toEqual({ ok: true, value: { did: DID, nsid: NSID } })
  })

  it('parses a lexicon.garden link with a trailing slash', () => {
    const r = parsePermissionSetRef(`https://lexicon.garden/lexicon/${DID}/${NSID}/`)
    expect(r).toEqual({ ok: true, value: { did: DID, nsid: NSID } })
  })

  it('parses an at:// URI', () => {
    const r = parsePermissionSetRef(`at://${DID}/com.atproto.lexicon.schema/${NSID}`)
    expect(r).toEqual({ ok: true, value: { did: DID, nsid: NSID } })
  })

  it('trims surrounding whitespace', () => {
    const r = parsePermissionSetRef(`  at://${DID}/com.atproto.lexicon.schema/${NSID}  `)
    expect(r).toEqual({ ok: true, value: { did: DID, nsid: NSID } })
  })

  it('parses a did:web link', () => {
    const r = parsePermissionSetRef('https://lexicon.garden/lexicon/did:web:example.com/app.example.authThing')
    expect(r).toEqual({ ok: true, value: { did: 'did:web:example.com', nsid: 'app.example.authThing' } })
  })

  it('rejects a bare NSID (unsupported)', () => {
    const r = parsePermissionSetRef('app.bsky.authFullApp')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('invalid-input')
  })

  it('rejects a non-atproto URL', () => {
    const r = parsePermissionSetRef('https://example.com/whatever')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('invalid-input')
  })

  it('rejects an at:// URI with the wrong collection', () => {
    const r = parsePermissionSetRef(`at://${DID}/app.bsky.feed.post/${NSID}`)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('invalid-input')
  })

  it('rejects a malformed DID', () => {
    const r = parsePermissionSetRef('https://lexicon.garden/lexicon/did:bogus:xyz/app.x.y')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('invalid-input')
  })

  it('rejects an at:// URI with a trailing slash', () => {
    const r = parsePermissionSetRef(`at://${DID}/com.atproto.lexicon.schema/${NSID}/`)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('invalid-input')
  })

  it('rejects a non-NSID record key', () => {
    const r = parsePermissionSetRef(`https://lexicon.garden/lexicon/${DID}/notannsid`)
    expect(r.ok).toBe(false)
  })

  it('rejects empty input', () => {
    expect(parsePermissionSetRef('').ok).toBe(false)
  })
})
