#!/usr/bin/env node

/**
 * Hides a reply or detaches a quote post from the conversation component.
 *
 * For replies: adds the reply URI to the root post's threadgate hiddenReplies
 * ("hide reply for everyone" on bsky.app).
 *
 * For quote posts: adds the quote URI to the root post's postgate
 * detachedEmbeddingUris ("detach quote" on bsky.app).
 *
 * The script auto-detects whether the URL is a reply or quote post.
 *
 * Usage:
 *   npm run hide-reply <post-url>
 *
 * Examples:
 *   npm run hide-reply https://bsky.app/profile/did:plc:.../post/...  (reply)
 *   npm run hide-reply https://bsky.app/profile/did:plc:.../post/...  (quote)
 *
 * Requirements:
 *   - ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in .env
 */

import { Client } from '@atproto/lex'
import { PasswordSession } from '@atproto/lex-password-session'

const PUBLIC_API = 'https://public.api.bsky.app/xrpc'

/**
 * Convert a bsky.app URL to an AT URI.
 */
function toAtUri(url) {
  const m = url.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/?#]+)/)
  if (!m) return null
  return `at://${m[1]}/app.bsky.feed.post/${m[2]}`
}

/**
 * Extract the rkey from an AT URI.
 */
function rkey(atUri) {
  return atUri.split('/').pop()
}

/**
 * Find which of our posts this quote embeds, if any.
 * Handles both plain quotes (app.bsky.embed.record) and
 * quotes with media (app.bsky.embed.recordWithMedia).
 */
function findQuotedUri(post, ownerDid) {
  const record = post.record
  if (!record?.embed) return null

  let ref = null
  if (record.embed.$type === 'app.bsky.embed.record') {
    ref = record.embed.record
  } else if (record.embed.$type === 'app.bsky.embed.recordWithMedia') {
    ref = record.embed.record?.record
  }

  if (!ref?.uri) return null
  // Only match if the quoted post belongs to the authenticated user
  if (ref.uri.startsWith(`at://${ownerDid}/`)) return ref.uri
  return null
}

async function main() {
  const postUrl = process.argv[2]

  if (!postUrl) {
    console.error('Usage: npm run hide-reply <post-url>')
    console.error('Example: npm run hide-reply https://bsky.app/profile/did:plc:.../post/...')
    process.exit(1)
  }

  const postUri = toAtUri(postUrl)
  if (!postUri) {
    console.error('Error: Could not parse bsky.app URL.')
    console.error('Expected format: https://bsky.app/profile/<did-or-handle>/post/<rkey>')
    process.exit(1)
  }

  // Load environment variables
  const { ATPROTO_HANDLE, ATPROTO_APP_PASSWORD, ATPROTO_PDS_URL } = process.env

  if (!ATPROTO_HANDLE || !ATPROTO_APP_PASSWORD) {
    console.error('Error: Missing required environment variables.')
    console.error('Please set ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in your .env file.')
    process.exit(1)
  }

  const service = ATPROTO_PDS_URL || 'https://bsky.social'

  // Step 1: Fetch the post to determine what it is
  console.log(`\n🔍 Analyzing post...`)
  console.log(`   URI: ${postUri}`)

  const threadRes = await fetch(
    `${PUBLIC_API}/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=0&parentHeight=100`
  )
  if (!threadRes.ok) {
    console.error(`Error: Failed to fetch post (${threadRes.status})`)
    process.exit(1)
  }

  const threadData = await threadRes.json()
  const thread = threadData.thread

  if (!thread || thread.$type !== 'app.bsky.feed.defs#threadViewPost') {
    console.error('Error: Could not load post. It may have been deleted or blocked.')
    process.exit(1)
  }

  // Step 2: Authenticate
  console.log('\n🔐 Authenticating...')

  const session = await PasswordSession.create({
    service,
    identifier: ATPROTO_HANDLE,
    password: ATPROTO_APP_PASSWORD,
    onUpdated: () => {},
    onDeleted: () => {},
  })

  const client = new Client(session)
  console.log(`   ✓ Authenticated as ${session.handle}`)

  // Step 3: Determine if this is a reply or a quote post
  const hasParent = thread.parent && thread.parent.$type === 'app.bsky.feed.defs#threadViewPost'
  const quotedUri = findQuotedUri(thread.post, session.did)

  if (hasParent) {
    await hideReply(client, session, thread, postUri)
  } else if (quotedUri) {
    await detachQuote(client, session, quotedUri, postUri)
  } else {
    console.error('\nError: This post is neither a reply to one of your posts nor a quote of one of your posts.')
    process.exit(1)
  }
}

/**
 * Hide a reply by adding it to the root post's threadgate hiddenReplies.
 */
async function hideReply(client, session, thread, replyUri) {
  // Walk up to the root
  let node = thread
  while (node.parent && node.parent.$type === 'app.bsky.feed.defs#threadViewPost') {
    node = node.parent
  }

  const rootUri = node.post.uri
  const rootRkey = rkey(rootUri)
  const rootDid = rootUri.replace('at://', '').split('/')[0]

  console.log(`\n   Type: Reply`)
  console.log(`   Root: ${rootUri}`)
  console.log(`   By:   ${node.post.author.handle}`)

  if (session.did !== rootDid) {
    console.error(`\nError: You are authenticated as ${session.did} but the root post belongs to ${rootDid}.`)
    console.error('You can only hide replies on your own posts.')
    process.exit(1)
  }

  // Get existing threadgate
  console.log('\n📋 Checking for existing threadgate...')

  let existingValue = null
  try {
    const res = await client.getRecord('app.bsky.feed.threadgate', rootRkey)
    existingValue = res.payload.body.value
    const hidden = existingValue.hiddenReplies || []
    console.log(`   Found threadgate with ${hidden.length} hidden replies`)

    if (hidden.includes(replyUri)) {
      console.log('\n⚠️  This reply is already hidden. Nothing to do.')
      process.exit(0)
    }
  } catch {
    console.log('   No existing threadgate — will create one')
  }

  const record = existingValue
    ? {
        ...existingValue,
        hiddenReplies: [...(existingValue.hiddenReplies || []), replyUri],
      }
    : {
        $type: 'app.bsky.feed.threadgate',
        post: rootUri,
        createdAt: new Date().toISOString(),
        hiddenReplies: [replyUri],
      }

  console.log('\n📤 Updating threadgate...')
  const result = await client.putRecord(record, rootRkey)

  console.log('\n✅ Reply hidden successfully!')
  console.log(`   URI: ${result.uri}`)
  console.log(`   Hidden replies: ${record.hiddenReplies.length}`)
}

/**
 * Detach a quote post by adding it to the root post's postgate detachedEmbeddingUris.
 */
async function detachQuote(client, session, quotedUri, quoteUri) {
  const quotedRkey = rkey(quotedUri)

  console.log(`\n   Type:   Quote post`)
  console.log(`   Quotes: ${quotedUri}`)

  // Get existing postgate
  console.log('\n📋 Checking for existing postgate...')

  let existingValue = null
  try {
    const res = await client.getRecord('app.bsky.feed.postgate', quotedRkey)
    existingValue = res.payload.body.value
    const detached = existingValue.detachedEmbeddingUris || []
    console.log(`   Found postgate with ${detached.length} detached quotes`)

    if (detached.includes(quoteUri)) {
      console.log('\n⚠️  This quote is already detached. Nothing to do.')
      process.exit(0)
    }
  } catch {
    console.log('   No existing postgate — will create one')
  }

  const record = existingValue
    ? {
        ...existingValue,
        detachedEmbeddingUris: [...(existingValue.detachedEmbeddingUris || []), quoteUri],
      }
    : {
        $type: 'app.bsky.feed.postgate',
        post: quotedUri,
        createdAt: new Date().toISOString(),
        detachedEmbeddingUris: [quoteUri],
      }

  console.log('\n📤 Updating postgate...')
  const result = await client.putRecord(record, quotedRkey)

  console.log('\n✅ Quote detached successfully!')
  console.log(`   URI: ${result.uri}`)
  console.log(`   Detached quotes: ${record.detachedEmbeddingUris.length}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
