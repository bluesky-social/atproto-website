#!/usr/bin/env node

/**
 * Creates a site.standard.publication record for atproto.com
 *
 * Usage:
 *   1. Copy .env.example to .env and fill in your credentials
 *   2. Run: npm run create-publication
 *
 * This only needs to be run once to set up the publication record.
 * The resulting AT-URI should be saved for use when publishing documents.
 */

const PUBLICATION_URL = 'https://atproto.com'
const PUBLICATION_NAME = 'AT Protocol'
const PUBLICATION_DESCRIPTION =
  'Documentation, guides, and updates for the AT Protocol - the decentralized foundation for social networking.'

async function main() {
  // Load environment variables
  const { ATPROTO_HANDLE, ATPROTO_APP_PASSWORD, ATPROTO_PDS_URL } = process.env

  if (!ATPROTO_HANDLE || !ATPROTO_APP_PASSWORD) {
    console.error('Error: Missing required environment variables.')
    console.error('Please set ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in your .env file.')
    console.error('See .env.example for details.')
    process.exit(1)
  }

  const pdsUrl = ATPROTO_PDS_URL || 'https://bsky.social'

  console.log(`\n📝 Creating publication record for ${PUBLICATION_URL}\n`)
  console.log(`  PDS: ${pdsUrl}`)
  console.log(`  Handle: ${ATPROTO_HANDLE}`)

  // Create session
  console.log('\n🔐 Authenticating...')
  const sessionResponse = await fetch(`${pdsUrl}/xrpc/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: ATPROTO_HANDLE,
      password: ATPROTO_APP_PASSWORD,
    }),
  })

  if (!sessionResponse.ok) {
    const error = await sessionResponse.text()
    console.error('Authentication failed:', error)
    process.exit(1)
  }

  const session = await sessionResponse.json()
  console.log(`✓ Authenticated as ${session.handle} (${session.did})`)

  // Check if publication already exists
  console.log('\n🔍 Checking for existing publication...')
  const listResponse = await fetch(
    `${pdsUrl}/xrpc/com.atproto.repo.listRecords?repo=${session.did}&collection=site.standard.publication&limit=10`,
    {
      headers: { Authorization: `Bearer ${session.accessJwt}` },
    }
  )

  if (listResponse.ok) {
    const { records } = await listResponse.json()
    const existing = records.find((r) => r.value.url === PUBLICATION_URL)
    if (existing) {
      console.log(`\n⚠️  Publication already exists!`)
      console.log(`   AT-URI: ${existing.uri}`)
      console.log(`   URL: ${existing.value.url}`)
      console.log(`   Name: ${existing.value.name}`)
      console.log('\nTo create a new one, delete the existing record first.')
      process.exit(0)
    }
  }

  // Create the publication record
  console.log('\n📤 Creating publication record...')

  const record = {
    $type: 'site.standard.publication',
    url: PUBLICATION_URL,
    name: PUBLICATION_NAME,
    description: PUBLICATION_DESCRIPTION,
    preferences: {
      showInDiscover: true,
    },
  }

  const createResponse = await fetch(`${pdsUrl}/xrpc/com.atproto.repo.createRecord`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'site.standard.publication',
      record,
    }),
  })

  if (!createResponse.ok) {
    const error = await createResponse.text()
    console.error('Failed to create record:', error)
    process.exit(1)
  }

  const result = await createResponse.json()

  console.log('\n✅ Publication created successfully!\n')
  console.log(`   AT-URI: ${result.uri}`)
  console.log(`   CID: ${result.cid}`)
  console.log(`\n📋 Save this AT-URI for publishing documents:`)
  console.log(`   ATPROTO_PUBLICATION_URI=${result.uri}`)
  console.log(`\n   Add this to your .env file.`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
