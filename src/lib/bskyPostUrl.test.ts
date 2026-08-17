import { describe, it, expect } from 'vitest'
import { isBskyPostUrl, parseAtUri, atUriToBskyPostUrl } from './bskyPostUrl'

const POST_URL = 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d'
const POST_AT_URI =
  'at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/app.bsky.feed.post/3msydg6sd7s2d'
const DOC_AT_URI =
  'at://did:plc:ewvi7nxzyoun6zhxrhs64oiz/site.standard.document/3msxzige4ui2w'

describe('isBskyPostUrl', () => {
  it('accepts both forms in use across the blog', () => {
    expect(isBskyPostUrl(POST_URL)).toBe(true)
    expect(
      isBskyPostUrl(
        'https://bsky.app/profile/did:plc:ewvi7nxzyoun6zhxrhs64oiz/post/3msydg6sd7s2d',
      ),
    ).toBe(true)
  })

  it('tolerates surrounding whitespace, since this is pasted in', () => {
    expect(isBskyPostUrl(`  ${POST_URL}  `)).toBe(true)
  })

  it('rejects an empty or partial URL', () => {
    expect(isBskyPostUrl('')).toBe(false)
    expect(isBskyPostUrl('https://bsky.app/profile/atproto.com')).toBe(false)
    expect(isBskyPostUrl('https://bsky.app/profile/atproto.com/post/')).toBe(false)
  })

  // resolveBskyPostRef in scripts/publish-post.mjs parses the same shape to build
  // the strongRef. Anything it can't parse must not reach the header.
  it('rejects other hosts and schemes', () => {
    expect(isBskyPostUrl('http://bsky.app/profile/atproto.com/post/3msydg6sd7s2d')).toBe(false)
    expect(isBskyPostUrl('https://example.com/profile/atproto.com/post/3msydg6sd7s2d')).toBe(false)
    expect(isBskyPostUrl(POST_AT_URI)).toBe(false)
  })

  it('rejects a URL with trailing path or query', () => {
    expect(isBskyPostUrl(`${POST_URL}/extra`)).toBe(false)
    expect(isBskyPostUrl(`${POST_URL}?utm=x`)).toBe(false)
  })
})

describe('parseAtUri', () => {
  it('splits a record URI into its three parts', () => {
    expect(parseAtUri(DOC_AT_URI)).toEqual({
      repo: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
      collection: 'site.standard.document',
      rkey: '3msxzige4ui2w',
    })
  })

  it('returns null for anything that is not a full record URI', () => {
    expect(parseAtUri('')).toBeNull()
    expect(parseAtUri('at://did:plc:abc')).toBeNull()
    expect(parseAtUri('at://did:plc:abc/site.standard.document')).toBeNull()
    expect(parseAtUri(POST_URL)).toBeNull()
  })
})

describe('atUriToBskyPostUrl', () => {
  // toAtUri in public/bsky-conversation.js returns null for anything that isn't a
  // bsky.app URL, so the record's AT URI has to be converted before the web
  // component will accept it.
  it('converts a post ref to the URL the web component accepts', () => {
    expect(atUriToBskyPostUrl(POST_AT_URI)).toBe(
      'https://bsky.app/profile/did:plc:ewvi7nxzyoun6zhxrhs64oiz/post/3msydg6sd7s2d',
    )
  })

  it('round-trips back to something isBskyPostUrl accepts', () => {
    expect(isBskyPostUrl(atUriToBskyPostUrl(POST_AT_URI)!)).toBe(true)
  })

  it('refuses a URI that is not a Bluesky post', () => {
    expect(atUriToBskyPostUrl(DOC_AT_URI)).toBeNull()
    expect(atUriToBskyPostUrl('not a uri')).toBeNull()
  })
})
