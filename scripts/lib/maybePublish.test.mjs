// scripts/lib/maybePublish.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { maybePublish } from './maybePublish.mjs'

test('skips publishing when noSsite is set and never calls publishFn', async () => {
  let called = false
  const publishFn = async () => {
    called = true
    return 'at://nope'
  }
  const result = await maybePublish('my-post', { noSsite: true, publishFn })
  assert.equal(result.status, 'skipped')
  assert.equal(called, false)
})

test('returns published with the AT-URI on success', async () => {
  const publishFn = async (slug) => `at://did:plc:abc/site.standard.document/${slug}`
  const result = await maybePublish('my-post', { noSsite: false, publishFn })
  assert.equal(result.status, 'published')
  assert.equal(result.uri, 'at://did:plc:abc/site.standard.document/my-post')
})

test('returns failed and does not throw when publishFn rejects', async () => {
  const publishFn = async () => {
    throw new Error('boom')
  }
  const result = await maybePublish('my-post', { noSsite: false, publishFn })
  assert.equal(result.status, 'failed')
  assert.equal(result.error.message, 'boom')
})
