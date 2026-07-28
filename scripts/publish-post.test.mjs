// scripts/publish-post.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { main } from './publish-post.mjs'

test('throws when slug is missing', async () => {
  await assert.rejects(() => main(), /Usage: npm run blog ssite/)
})

test('throws when credentials are missing', async () => {
  const { ATPROTO_HANDLE, ATPROTO_APP_PASSWORD } = process.env
  delete process.env.ATPROTO_HANDLE
  delete process.env.ATPROTO_APP_PASSWORD
  try {
    await assert.rejects(
      () => main('any-slug'),
      /Missing required environment variables/,
    )
  } finally {
    if (ATPROTO_HANDLE !== undefined) process.env.ATPROTO_HANDLE = ATPROTO_HANDLE
    if (ATPROTO_APP_PASSWORD !== undefined)
      process.env.ATPROTO_APP_PASSWORD = ATPROTO_APP_PASSWORD
  }
})

test('throws when the post does not exist', async () => {
  const prevH = process.env.ATPROTO_HANDLE
  const prevP = process.env.ATPROTO_APP_PASSWORD
  process.env.ATPROTO_HANDLE = 'fake.test'
  process.env.ATPROTO_APP_PASSWORD = 'fake-app-password'
  try {
    await assert.rejects(
      () => main('definitely-not-a-real-post-xyz'),
      /Post not found/,
    )
  } finally {
    if (prevH === undefined) delete process.env.ATPROTO_HANDLE
    else process.env.ATPROTO_HANDLE = prevH
    if (prevP === undefined) delete process.env.ATPROTO_APP_PASSWORD
    else process.env.ATPROTO_APP_PASSWORD = prevP
  }
})
