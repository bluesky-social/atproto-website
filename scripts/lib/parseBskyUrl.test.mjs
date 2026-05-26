// scripts/lib/parseBskyUrl.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseBskyUrl } from './parseBskyUrl.mjs'

test('parses DID-form URL', () => {
  const out = parseBskyUrl(
    'https://bsky.app/profile/did:plc:ewvi7nxzyoun6zhxrhs64oiz/post/3mhjb5565us2t',
  )
  assert.deepEqual(out, {
    handleOrDid: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
    rkey: '3mhjb5565us2t',
  })
})

test('parses handle-form URL', () => {
  const out = parseBskyUrl('https://bsky.app/profile/atproto.com/post/3mhtaxg4ppk2v')
  assert.deepEqual(out, { handleOrDid: 'atproto.com', rkey: '3mhtaxg4ppk2v' })
})

test('throws on non-bsky URL', () => {
  assert.throws(
    () => parseBskyUrl('https://example.com/post/abc'),
    /not a bsky\.app post URL/i,
  )
})

test('throws on bsky URL without /post/<rkey>', () => {
  assert.throws(
    () => parseBskyUrl('https://bsky.app/profile/atproto.com'),
    /missing rkey/i,
  )
})
