import { describe, it, expect } from 'vitest'
import { bskyPostRefUri, pdsEndpoint, fetchBskyPostUrl } from './standardSite'

// Trimmed from the live record
// at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/site.standard.document/3msxzige4ui2w
const RECORD = {
  value: {
    $type: 'site.standard.document',
    path: '/introducing-bluesky-protocol-services',
    title: 'Introducing Bluesky Protocol Services',
    bskyPostRef: {
      $type: 'com.atproto.repo.strongRef',
      uri: 'at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.post/3msydg6sd7s2d',
      cid: 'bafyreibhm3vrwwo6ckevuocbv3gp47z4g5b7ts26lroewjwkl4qt3il7km',
    },
  },
}

describe('bskyPostRefUri', () => {
  it('pulls the post URI off a getRecord response', () => {
    expect(bskyPostRefUri(RECORD)).toBe(
      'at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.post/3msydg6sd7s2d',
    )
  })

  // The window this feature exists for: the article is live, the thread isn't
  // posted yet, so the record has no ref. Nothing renders.
  it('returns null when the record has no ref yet', () => {
    expect(bskyPostRefUri({ value: { $type: 'site.standard.document' } })).toBeNull()
  })

  it('returns null for junk instead of throwing', () => {
    expect(bskyPostRefUri(null)).toBeNull()
    expect(bskyPostRefUri('a string')).toBeNull()
    expect(bskyPostRefUri({})).toBeNull()
    expect(bskyPostRefUri({ value: { bskyPostRef: {} } })).toBeNull()
    expect(bskyPostRefUri({ value: { bskyPostRef: { uri: 42 } } })).toBeNull()
  })
})

describe('pdsEndpoint', () => {
  it('finds the atproto PDS in a DID document', () => {
    expect(
      pdsEndpoint({
        service: [
          { id: '#other', type: 'Other', serviceEndpoint: 'https://nope.example' },
          {
            id: '#atproto_pds',
            type: 'AtprotoPersonalDataServer',
            serviceEndpoint: 'https://enoki.us-east.host.bsky.network',
          },
        ],
      }),
    ).toBe('https://enoki.us-east.host.bsky.network')
  })

  it('returns null when there is no PDS entry', () => {
    expect(pdsEndpoint({ service: [] })).toBeNull()
    expect(pdsEndpoint({})).toBeNull()
    expect(pdsEndpoint(null)).toBeNull()
  })
})

// Same fixture values as the live record above, plus the DID document and PDS
// that actually serve it — not invented, so the getRecord URL assertions below
// are checking against a shape that really occurs.
const DID = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz'
const DOC_URI = `at://${DID}/site.standard.document/3msxzige4ui2w`
const POST_REF_URI = `at://${DID}/app.bsky.feed.post/3msydg6sd7s2d`
const PDS = 'https://enoki.us-east.host.bsky.network'
const PLC_URL = `https://plc.directory/${DID}`
const PLC_DOC = {
  id: DID,
  service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: PDS }],
}
// repo/collection are percent-encoded by fetchBskyPostUrl; the DID's colons are
// what make that visible (rkey is alphanumeric, so it round-trips unchanged).
const GET_RECORD_URL =
  `${PDS}/xrpc/com.atproto.repo.getRecord` +
  `?repo=${encodeURIComponent(DID)}&collection=${encodeURIComponent('site.standard.document')}&rkey=3msxzige4ui2w`
const RECORD_WITH_REF = {
  value: {
    $type: 'site.standard.document',
    bskyPostRef: {
      $type: 'com.atproto.repo.strongRef',
      uri: POST_REF_URI,
      cid: 'bafyreibhm3vrwwo6ckevuocbv3gp47z4g5b7ts26lroewjwkl4qt3il7km',
    },
  },
}

// Same stub-fetch pattern as ScopeBuilder/permissionSetResolver.test.ts's
// mockFetch: a plain object of exact-URL routes, no test dependencies, no real
// network. `fetchFn` is the same defaulted-parameter name used there.
function mockFetch(
  routes: Record<string, { status?: number; json?: unknown; body?: string }>,
): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    const route = routes[url]
    if (!route) return new Response('not found', { status: 404 })
    if (route.body !== undefined) {
      return new Response(route.body, { status: route.status ?? 200 })
    }
    return new Response(route.json === undefined ? '' : JSON.stringify(route.json), {
      status: route.status ?? 200,
      headers: { 'content-type': 'application/json' },
    })
  }) as typeof fetch
}

describe('fetchBskyPostUrl', () => {
  it('resolves end-to-end (did:plc → PDS → getRecord) to the bsky.app URL', async () => {
    const fetchFn = mockFetch({
      [PLC_URL]: { json: PLC_DOC },
      [GET_RECORD_URL]: { json: RECORD_WITH_REF },
    })
    expect(await fetchBskyPostUrl(DOC_URI, fetchFn)).toBe(
      `https://bsky.app/profile/${DID}/post/3msydg6sd7s2d`,
    )
  })

  it('returns null when the record has no bskyPostRef yet', async () => {
    const fetchFn = mockFetch({
      [PLC_URL]: { json: PLC_DOC },
      [GET_RECORD_URL]: { json: { value: { $type: 'site.standard.document' } } },
    })
    expect(await fetchBskyPostUrl(DOC_URI, fetchFn)).toBeNull()
  })

  it('returns null on a non-OK HTTP response from getRecord', async () => {
    const fetchFn = mockFetch({
      [PLC_URL]: { json: PLC_DOC },
      [GET_RECORD_URL]: { status: 500, json: { error: 'InternalServerError' } },
    })
    expect(await fetchBskyPostUrl(DOC_URI, fetchFn)).toBeNull()
  })

  it('returns null on malformed JSON instead of throwing', async () => {
    const fetchFn = mockFetch({
      [PLC_URL]: { json: PLC_DOC },
      [GET_RECORD_URL]: { body: 'not json' },
    })
    expect(await fetchBskyPostUrl(DOC_URI, fetchFn)).toBeNull()
  })

  it('returns null for an unknown DID method without fetching', async () => {
    const fetchFn = mockFetch({}) // any call here would 404 and still resolve null
    const uri = 'at://did:example:abc/site.standard.document/xyz'
    expect(await fetchBskyPostUrl(uri, fetchFn)).toBeNull()
  })

  it('trims a trailing slash off the PDS before building the getRecord URL', async () => {
    const fetchFn = mockFetch({
      [PLC_URL]: {
        json: {
          ...PLC_DOC,
          service: [
            { id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: `${PDS}/` },
          ],
        },
      },
      // Keyed by the *trimmed* URL: if the implementation stopped trimming,
      // the double slash would miss this route, 404, and the test would fail.
      [GET_RECORD_URL]: { json: RECORD_WITH_REF },
    })
    expect(await fetchBskyPostUrl(DOC_URI, fetchFn)).toBe(
      `https://bsky.app/profile/${DID}/post/3msydg6sd7s2d`,
    )
  })

  it('percent-encodes repo, collection, and rkey in the getRecord URL', async () => {
    const calls: string[] = []
    const fetchFn = (async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      calls.push(url)
      const body = url === PLC_URL ? PLC_DOC : RECORD_WITH_REF
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }) as typeof fetch
    await fetchBskyPostUrl(DOC_URI, fetchFn)
    expect(calls.find((u) => u.includes('getRecord'))).toBe(GET_RECORD_URL)
  })
})
