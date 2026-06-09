import { describe, it, expect } from 'vitest'
import { parsePermissionSetRef, resolveDidToPds, fetchPermissionSetRecord, lexiconToCuratedScope, resolvePermissionSet, findCrossNamespacePermissions } from './permissionSetResolver'
import type { PermissionSetLexicon } from './types'

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

const PDS = 'https://pds.example.com'
const REC_NSID = 'app.bsky.authFullApp'
const GET_RECORD_URL =
  `${PDS}/xrpc/com.atproto.repo.getRecord` +
  `?repo=${PLC_DID}&collection=com.atproto.lexicon.schema&rkey=${REC_NSID}`

const VALID_RECORD_VALUE = {
  lexicon: 1,
  id: REC_NSID,
  defs: {
    main: {
      type: 'permission-set',
      title: 'Full Bluesky',
      detail: 'Everything.',
      permissions: [
        { type: 'permission', resource: 'repo', collection: ['app.bsky.feed.post'], action: ['create', 'delete'] },
        { type: 'permission', resource: 'rpc', lxm: ['app.bsky.feed.getTimeline'], inheritAud: true },
      ],
    },
  },
}

describe('fetchPermissionSetRecord', () => {
  it('returns the lexicon record value on success', async () => {
    const fetchFn = mockFetch({ [GET_RECORD_URL]: { json: { uri: 'at://x', cid: 'y', value: VALID_RECORD_VALUE } } })
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r).toEqual({ ok: true, value: VALID_RECORD_VALUE })
  })

  it('returns record-not-found on a 400/404', async () => {
    const fetchFn = mockFetch({ [GET_RECORD_URL]: { status: 400, json: { error: 'RecordNotFound' } } })
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('record-not-found')
  })

  it('returns not-permission-set when defs.main.type is wrong', async () => {
    const wrong = { ...VALID_RECORD_VALUE, defs: { main: { ...VALID_RECORD_VALUE.defs.main, type: 'query' } } }
    const fetchFn = mockFetch({ [GET_RECORD_URL]: { json: { value: wrong } } })
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('not-permission-set')
  })

  it('returns not-permission-set when defs.main is missing', async () => {
    const fetchFn = mockFetch({ [GET_RECORD_URL]: { json: { value: { lexicon: 1, id: REC_NSID, defs: {} } } } })
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('not-permission-set')
  })

  it('returns network when fetch throws', async () => {
    const fetchFn = (async () => {
      throw new TypeError('boom')
    }) as typeof fetch
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('network')
  })

  it('returns record-not-found when the body is not JSON', async () => {
    const fetchFn = (async () => new Response('not json', { status: 200 })) as typeof fetch
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('record-not-found')
  })

  it('returns not-permission-set when the record id is not a valid NSID', async () => {
    const evil = { ...VALID_RECORD_VALUE, id: '"><script>alert(1)</script>' }
    const fetchFn = mockFetch({ [GET_RECORD_URL]: { json: { value: evil } } })
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('not-permission-set')
  })
})

describe('lexiconToCuratedScope', () => {
  const scope = lexiconToCuratedScope(VALID_RECORD_VALUE as PermissionSetLexicon, PLC_DID)

  it('uses the NSID as id and title as label', () => {
    expect(scope.id).toBe(REC_NSID)
    expect(scope.label).toBe('Full Bluesky')
    expect(scope.description).toBe('Everything.')
  })

  it('is a permission-set marked unverified', () => {
    expect(scope.kind).toBe('permission-set')
    expect(scope.resourceType).toBe('include')
    expect(scope.warning).toBe('unverified')
  })

  it('emits include:{nsid} as the scope string', () => {
    expect(scope.scopeString).toBe(`include:${REC_NSID}`)
  })

  it('expands repo permissions, one entry per collection', () => {
    expect(scope.expandedPermissions?.repo).toEqual([
      { collection: 'app.bsky.feed.post', actions: ['create', 'delete'] },
    ])
  })

  it('flattens rpc lxm values', () => {
    expect(scope.expandedPermissions?.rpc).toEqual(['app.bsky.feed.getTimeline'])
  })

  it('builds a lexicon.garden spec link', () => {
    expect(scope.specLink).toBe(`https://lexicon.garden/lexicon/${PLC_DID}/${REC_NSID}`)
  })

  it('defaults repo actions to all three when action is omitted', () => {
    const rec = {
      ...VALID_RECORD_VALUE,
      defs: { main: { ...VALID_RECORD_VALUE.defs.main, permissions: [
        { type: 'permission', resource: 'repo', collection: ['a.b.c'] },
      ] } },
    }
    const s = lexiconToCuratedScope(rec as PermissionSetLexicon, PLC_DID)
    expect(s.expandedPermissions?.repo).toEqual([{ collection: 'a.b.c', actions: ['create', 'update', 'delete'] }])
  })

  it('expands a multi-collection repo permission into multiple entries', () => {
    const rec = {
      ...VALID_RECORD_VALUE,
      defs: { main: { ...VALID_RECORD_VALUE.defs.main, permissions: [
        { type: 'permission', resource: 'repo', collection: ['a.b.c', 'd.e.f'], action: ['create'] },
      ] } },
    }
    const s = lexiconToCuratedScope(rec as PermissionSetLexicon, PLC_DID)
    expect(s.expandedPermissions?.repo).toEqual([
      { collection: 'a.b.c', actions: ['create'] },
      { collection: 'd.e.f', actions: ['create'] },
    ])
  })

  it('returns undefined expandedPermissions for an empty permission list', () => {
    const rec = { ...VALID_RECORD_VALUE, defs: { main: { ...VALID_RECORD_VALUE.defs.main, permissions: [] } } }
    const s = lexiconToCuratedScope(rec as PermissionSetLexicon, PLC_DID)
    expect(s.expandedPermissions).toBeUndefined()
  })

  it('drops unknown repo action strings, falling back to all write actions', () => {
    const rec = {
      ...VALID_RECORD_VALUE,
      defs: { main: { ...VALID_RECORD_VALUE.defs.main, permissions: [
        { type: 'permission', resource: 'repo', collection: ['a.b.c'], action: ['read', 'write'] },
      ] } },
    }
    const s = lexiconToCuratedScope(rec as PermissionSetLexicon, PLC_DID)
    expect(s.expandedPermissions?.repo).toEqual([{ collection: 'a.b.c', actions: ['create', 'update', 'delete'] }])
  })
})

describe('resolvePermissionSet (end to end, mocked fetch)', () => {
  it('resolves a lexicon.garden link to a CuratedScope', async () => {
    const fetchFn = mockFetch({
      [`https://plc.directory/${PLC_DID}`]: { json: PLC_DOC },
      [GET_RECORD_URL]: { json: { value: VALID_RECORD_VALUE } },
    })
    const r = await resolvePermissionSet(`https://lexicon.garden/lexicon/${PLC_DID}/${REC_NSID}`, fetchFn)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.id).toBe(REC_NSID)
      expect(r.value.warning).toBe('unverified')
    }
  })

  it('short-circuits with the parse error on bad input', async () => {
    const fetchFn = mockFetch({})
    const r = await resolvePermissionSet('not a link', fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('invalid-input')
  })

  it('surfaces a DID resolution failure', async () => {
    const fetchFn = mockFetch({}) // plc.directory 404s
    const r = await resolvePermissionSet(`https://lexicon.garden/lexicon/${PLC_DID}/${REC_NSID}`, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('did-unresolvable')
  })
})

describe('field-name leniency', () => {
  it('accepts a record that uses description instead of detail', async () => {
    const rec = { lexicon: 1, id: REC_NSID, defs: { main: { type: 'permission-set', title: 'X', description: 'desc', permissions: [{ type: 'permission', resource: 'repo', action: ['create'], collection: ['app.bsky.thing'] }] } } }
    const fetchFn = mockFetch({ [GET_RECORD_URL]: { json: { value: rec } } })
    const r = await fetchPermissionSetRecord(PDS, PLC_DID, REC_NSID, fetchFn)
    expect(r.ok).toBe(true)
  })

  it('maps description into the scope description when detail is absent', () => {
    const rec = { lexicon: 1, id: REC_NSID, defs: { main: { type: 'permission-set', title: 'T', description: 'from description', permissions: [] } } }
    const s = lexiconToCuratedScope(rec as unknown as Parameters<typeof lexiconToCuratedScope>[0], PLC_DID)
    expect(s.description).toBe('from description')
  })

  it('maps details (plural) when detail and description are absent', () => {
    const rec = { lexicon: 1, id: REC_NSID, defs: { main: { type: 'permission-set', title: 'T', details: 'from details', permissions: [] } } }
    const s = lexiconToCuratedScope(rec as unknown as Parameters<typeof lexiconToCuratedScope>[0], PLC_DID)
    expect(s.description).toBe('from details')
  })

  it('falls back to the nsid for the label when title is absent', () => {
    const rec = { lexicon: 1, id: REC_NSID, defs: { main: { type: 'permission-set', detail: 'd', permissions: [] } } }
    const s = lexiconToCuratedScope(rec as unknown as Parameters<typeof lexiconToCuratedScope>[0], PLC_DID)
    expect(s.label).toBe(REC_NSID)
  })
})

describe('findCrossNamespacePermissions', () => {
  it('returns [] for an in-namespace set', () => {
    expect(findCrossNamespacePermissions(VALID_RECORD_VALUE as unknown as Parameters<typeof findCrossNamespacePermissions>[0])).toEqual([])
  })

  it('flags repo collections outside the set namespace, keeps in-namespace ones', () => {
    const rec = { lexicon: 1, id: 'com.babesky.authManageSocial', defs: { main: { type: 'permission-set', title: 'X', detail: 'Y', permissions: [{ type: 'permission', action: ['create'], resource: 'repo', collection: ['app.bsky.graph.follow', 'com.babesky.thing'] }] } } }
    expect(findCrossNamespacePermissions(rec as unknown as Parameters<typeof findCrossNamespacePermissions>[0])).toEqual(['app.bsky.graph.follow'])
  })

  it('flags rpc lxm outside the set namespace', () => {
    const rec = { lexicon: 1, id: 'com.acme.authThing', defs: { main: { type: 'permission-set', title: 'X', detail: 'Y', permissions: [{ type: 'permission', resource: 'rpc', inheritAud: true, lxm: ['app.bsky.feed.getTimeline'] }] } } }
    expect(findCrossNamespacePermissions(rec as unknown as Parameters<typeof findCrossNamespacePermissions>[0])).toEqual(['app.bsky.feed.getTimeline'])
  })

  it('treats a wildcard collection as a violation', () => {
    const rec = { lexicon: 1, id: 'com.acme.authThing', defs: { main: { type: 'permission-set', title: 'X', detail: 'Y', permissions: [{ type: 'permission', action: ['create'], resource: 'repo', collection: ['*'] }] } } }
    expect(findCrossNamespacePermissions(rec as unknown as Parameters<typeof findCrossNamespacePermissions>[0])).toEqual(['*'])
  })
})

describe('resolvePermissionSet cross-namespace rejection (babesky case)', () => {
  it('rejects a set that declares permissions outside its namespace, even with a details typo', async () => {
    const BABE_DID = 'did:plc:qtapiembzpxlzsiagnc7eyy3'
    const babeDoc = { id: BABE_DID, service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: 'https://pds.babe.example' }] }
    const evil = { lexicon: 1, id: 'com.babesky.authManageSocial', defs: { main: { type: 'permission-set', title: 'Manage Social', details: 'controls', permissions: [{ type: 'permission', action: ['create', 'update', 'delete'], resource: 'repo', collection: ['app.bsky.graph.follow', 'app.bsky.feed.repost'] }] } } }
    const recUrl = `https://pds.babe.example/xrpc/com.atproto.repo.getRecord?repo=${BABE_DID}&collection=com.atproto.lexicon.schema&rkey=com.babesky.authManageSocial`
    const fetchFn = mockFetch({ [`https://plc.directory/${BABE_DID}`]: { json: babeDoc }, [recUrl]: { json: { value: evil } } })
    const r = await resolvePermissionSet(`https://lexicon.garden/lexicon/${BABE_DID}/com.babesky.authManageSocial`, fetchFn)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.code).toBe('cross-namespace')
  })
})
