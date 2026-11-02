import { test } from 'node:test'
import assert from 'node:assert/strict'
import { findDocumentByPath, assertListingTags } from './blogPublishing.mjs'

test('finds an existing document after the first 100 records', async () => {
  const match = { uri: 'at://existing', value: { path: '/older-post' } }
  const calls = []
  const client = {
    list: async (schema, options) => {
      calls.push({ schema, options })
      return options.cursor
        ? { records: [match] }
        : {
            records: Array.from({ length: 100 }, (_, i) => ({
              value: { path: `/other-${i}` },
            })),
            cursor: 'next-page',
          }
    },
  }
  assert.equal(
    await findDocumentByPath(client, 'document', '/older-post'),
    match,
  )
  assert.deepEqual(calls, [
    { schema: 'document', options: { limit: 100 } },
    { schema: 'document', options: { limit: 100, cursor: 'next-page' } },
  ])
})

test('only considers a document new after exhausting all pages', async () => {
  let calls = 0
  const client = {
    list: async (_, options) => {
      calls++
      return { records: [], ...(options.cursor ? {} : { cursor: 'last' }) }
    },
  }
  assert.equal(await findDocumentByPath(client, 'document', '/new'), undefined)
  assert.equal(calls, 2)
})

test('stops pagination as soon as the matching document is found', async () => {
  let calls = 0
  const client = {
    list: async () => {
      calls++
      return { records: [{ value: { path: '/found' } }], cursor: 'unused' }
    },
  }
  assert.ok(await findDocumentByPath(client, 'document', '/found'))
  assert.equal(calls, 1)
})

test('requires the MDX and listing to contain the same tags before publishing', () => {
  const posts = [{ slug: 'post', tags: ['spaces', 'identity'] }]
  assert.doesNotThrow(() =>
    assertListingTags('post', ['identity', 'spaces', 'spaces'], posts),
  )
  assert.throws(
    () => assertListingTags('post', ['sync'], posts),
    /Update both before publishing/,
  )
  assert.throws(
    () => assertListingTags('missing', [], posts),
    /missing from src\/lib\/posts.ts/,
  )
  assert.doesNotThrow(() =>
    assertListingTags('old', undefined, [{ slug: 'old' }]),
  )
})
