import { describe, it, expect } from 'vitest'
import { parsePermissionSetRef, resolveDidToPds } from './permissionSetResolver'

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

function mockFetch(routes: Record<string, { status?: number; json?: unknown }>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    const route = routes[url]
    if (!route) return new Response('not found', { status: 404 })
    return new Response(route.json === undefined ? '' : JSON.stringify(route.json), {
      status: route.status ?? 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
}

const PLC_DID = 'did:plc:4v4y5r3lwsbtmsxhile2ljac'
const PLC_DOC = {
  id: PLC_DID,
  service: [
    { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example.com' },
  ],
}

describe('resolveDidToPds', () => {
  it('resolves a did:plc via plc.directory', async () => {
    const fetchFn = mockFetch({ [`https://plc.directory/${PLC_DID}`]: { json: PLC_DOC } })
    const r = await resolveDidToPds(PLC_DID, fetchFn)
    expect(r).toEqual({ ok: true, value: 'https://pds.example.com' })
  })

  it('resolves a did:web via /.well-known/did.json', async () => {
    const webDoc = {
      id: 'did:web:example.com',
      service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example.com' }],
    }
    const fetchFn = mockFetch({ 'https://example.com/.well-known/did.json': { json: webDoc } })
    const r = await resolveDidToPds('did:web:example.com', fetchFn)
    expect(r).toEqual({ ok: true, value: 'https://pds.example.com' })
  })

  it('returns did-unresolvable on a 404', async () => {
    const fetchFn = mockFetch({})
    const r = await resolveDidToPds(PLC_DID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('did-unresolvable')
  })

  it('returns no-pds when the document has no atproto_pds service', async () => {
    const fetchFn = mockFetch({ [`https://plc.directory/${PLC_DID}`]: { json: { id: PLC_DID, service: [] } } })
    const r = await resolveDidToPds(PLC_DID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('no-pds')
  })

  it('returns network when fetch throws', async () => {
    const fetchFn = (async () => {
      throw new TypeError('network down')
    }) as typeof fetch
    const r = await resolveDidToPds(PLC_DID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('network')
  })

  it('resolves a multi-segment did:web', async () => {
    const webDoc = {
      id: 'did:web:example.com:u:alice',
      service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example.com' }],
    }
    const fetchFn = mockFetch({ 'https://example.com/u/alice/did.json': { json: webDoc } })
    const r = await resolveDidToPds('did:web:example.com:u:alice', fetchFn)
    expect(r).toEqual({ ok: true, value: 'https://pds.example.com' })
  })

  it('resolves when the atproto_pds service uses an absolute id', async () => {
    const doc = {
      id: PLC_DID,
      service: [{ id: `${PLC_DID}#atproto_pds`, type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.example.com' }],
    }
    const fetchFn = mockFetch({ [`https://plc.directory/${PLC_DID}`]: { json: doc } })
    const r = await resolveDidToPds(PLC_DID, fetchFn)
    expect(r).toEqual({ ok: true, value: 'https://pds.example.com' })
  })
})
