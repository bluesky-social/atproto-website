#!/usr/bin/env node

/**
 * Hides a reply from the conversation component by adding it to the
 * root post's threadgate hiddenReplies list.
 *
 * This uses the "hide reply for everyone" mechanism — the reply URI is
 * written to the threadgate record on the authenticated user's PDS,
 * and the conversation component filters it out client-side.
 *
 * Usage:
 *   node scripts/hide-reply.mjs <reply-url>
 *
 * Example:
 *   node scripts/hide-reply.mjs https://bsky.app/profile/did:plc:6ghbu76mogjyfcvx446mep5o/post/3mf3jyihygs2l
 *
 * Requirements:
 *   - ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in .env
 */

const API = 'https://public.api.bsky.app/xrpc'

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

async function main() {
  const replyUrl = process.argv[2]

  if (!replyUrl) {
    console.error('Usage: node scripts/hide-reply.mjs <reply-url>')
    console.error('Example: node scripts/hide-reply.mjs https://bsky.app/profile/did:plc:.../post/...')
    process.exit(1)
  }

  const replyUri = toAtUri(replyUrl)
  if (!replyUri) {
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

  const pds = ATPROTO_PDS_URL || 'https://bsky.social'

  // Step 1: Find the root post by walking up the thread
  console.log(`\n🔍 Finding root post for reply...`)
  console.log(`   Reply: ${replyUri}`)

  const threadRes = await fetch(
    `${API}/app.bsky.feed.getPostThread?uri=${encodeURIComponent(replyUri)}&depth=0&parentHeight=100`
  )
  if (!threadRes.ok) {
    console.error(`Error: Failed to fetch thread (${threadRes.status})`)
    process.exit(1)
  }

  const threadData = await threadRes.json()

  // Walk up to the root
  let node = threadData.thread
  while (node.parent && node.parent.$type === 'app.bsky.feed.defs#threadViewPost') {
    node = node.parent
  }

  const rootUri = node.post.uri
  const rootRkey = rkey(rootUri)
  const rootDid = rootUri.replace('at://', '').split('/')[0]

  console.log(`   Root:  ${rootUri}`)
  console.log(`   By:    ${node.post.author.handle}`)

  if (replyUri === rootUri) {
    console.error('\nError: That URL is the root post, not a reply. Nothing to hide.')
    process.exit(1)
  }

  // Step 2: Authenticate
  console.log('\n🔐 Authenticating...')

  const sessionRes = await fetch(`${pds}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: ATPROTO_HANDLE,
      password: ATPROTO_APP_PASSWORD,
    }),
  })

  if (!sessionRes.ok) {
    console.error(`Error: Authentication failed (${sessionRes.status})`)
    process.exit(1)
  }

  const session = await sessionRes.json()
  console.log(`   ✓ Authenticated as ${session.handle}`)

  // Verify the authenticated user owns the root post
  if (session.did !== rootDid) {
    console.error(`\nError: You are authenticated as ${session.did} but the root post belongs to ${rootDid}.`)
    console.error('You can only hide replies on your own posts.')
    process.exit(1)
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.accessJwt}`,
  }

  // Step 3: Get existing threadgate (if any)
  console.log('\n📋 Checking for existing threadgate...')

  const gateRes = await fetch(
    `${pds}/xrpc/com.atproto.repo.getRecord?` +
      `repo=${encodeURIComponent(session.did)}&` +
      `collection=app.bsky.feed.threadgate&` +
      `rkey=${rootRkey}`,
    { headers: authHeaders }
  )

  let existingGate = null
  if (gateRes.ok) {
    existingGate = await gateRes.json()
    const hidden = existingGate.value.hiddenReplies || []
    console.log(`   Found threadgate with ${hidden.length} hidden replies`)

    if (hidden.includes(replyUri)) {
      console.log('\n⚠️  This reply is already hidden. Nothing to do.')
      process.exit(0)
    }
  } else {
    console.log('   No existing threadgate — will create one')
  }

  // Step 4: Write the threadgate with the reply added to hiddenReplies
  const record = existingGate
    ? {
        ...existingGate.value,
        hiddenReplies: [...(existingGate.value.hiddenReplies || []), replyUri],
      }
    : {
        $type: 'app.bsky.feed.threadgate',
        post: rootUri,
        createdAt: new Date().toISOString(),
        hiddenReplies: [replyUri],
      }

  console.log('\n📤 Updating threadgate...')

  const writeRes = await fetch(`${pds}/xrpc/com.atproto.repo.putRecord`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.threadgate',
      rkey: rootRkey,
      record,
    }),
  })

  if (!writeRes.ok) {
    const err = await writeRes.json().catch(() => ({}))
    console.error(`Error: Failed to write threadgate (${writeRes.status})`)
    console.error(err)
    process.exit(1)
  }

  const result = await writeRes.json()
  console.log('\n✅ Reply hidden successfully!')
  console.log(`   URI: ${result.uri}`)
  console.log(`   Hidden replies: ${record.hiddenReplies.length}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
