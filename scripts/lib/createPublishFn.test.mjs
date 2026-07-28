// scripts/lib/createPublishFn.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPublishFn } from './createPublishFn.mjs'

test('calls the imported main with the slug and returns its AT-URI', async () => {
  const importer = async () => ({
    main: async (slug) => `at://did:plc:abc/site.standard.document/${slug}`,
  })
  const publishFn = createPublishFn(importer)
  const uri = await publishFn('my-post')
  assert.equal(uri, 'at://did:plc:abc/site.standard.document/my-post')
})

test('propagates a module-load failure as a rejection (so maybePublish can catch it)', async () => {
  const importer = async () => {
    throw new Error('Cannot find module ../src/lexicons/site.ts')
  }
  const publishFn = createPublishFn(importer)
  await assert.rejects(() => publishFn('my-post'), /Cannot find module/)
})
