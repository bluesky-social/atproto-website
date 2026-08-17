import { describe, it, expect } from 'vitest'
import { bskyPostRefUri, pdsEndpoint } from './standardSite'

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
