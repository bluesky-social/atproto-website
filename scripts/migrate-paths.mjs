#!/usr/bin/env node

/**
 * One-off migration: rewrites site.standard.document records so their
 * `path` is relative to the publication root (now https://atproto.com/blog)
 * rather than the site root.
 *
 *   before: /blog/<slug>
 *   after:  /<slug>
 *
 * Run --dry-run first (default) to inspect the planned changes, then re-run
 * with --apply to mutate the records. Each record is updated via client.put
 * against its existing rkey, preserving the AT-URI referenced by every blog
 * post's MDX standardSiteUri header.
 *
 * Usage:
 *   npm run blog migrate-paths            # dry run
 *   npm run blog migrate-paths -- --apply # actually write
 */

import { Client } from '@atproto/lex'
import { PasswordSession } from '@atproto/lex-password-session'
import * as siteModule from '../src/lexicons/site.ts'
const { standard } = siteModule.default ?? siteModule

const OLD_PREFIX = '/blog/'
const NEW_PREFIX = '/'

export async function main(...args) {
  const apply = args.includes('--apply')
  const mode = apply ? 'APPLY' : 'DRY-RUN'

  const {
    ATPROTO_HANDLE,
    ATPROTO_APP_PASSWORD,
    ATPROTO_PDS_URL,
    ATPROTO_PUBLICATION_URI,
  } = process.env

  if (!ATPROTO_HANDLE || !ATPROTO_APP_PASSWORD) {
    console.error('Error: Missing required environment variables.')
    console.error('Please set ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in your .env file.')
    process.exit(1)
  }

  const service = ATPROTO_PDS_URL || 'https://bsky.social'

  console.log(`\n🔧 Migrate document paths (${mode})\n`)
  console.log(`  Service: ${service}`)
  console.log(`  Handle: ${ATPROTO_HANDLE}`)
  console.log(`  Rewrite: ${OLD_PREFIX}<slug>  →  ${NEW_PREFIX}<slug>`)

  const session = await PasswordSession.create({
    service,
    identifier: ATPROTO_HANDLE,
    password: ATPROTO_APP_PASSWORD,
    onUpdated: () => {},
    onDeleted: () => {},
  })

  const client = new Client(session)
  console.log(`✓ Authenticated as ${session.handle} (${session.did})`)

  // Guard: refuse to run against the wrong account when the publication URI
  // pins ownership to a specific DID. Mirrors the safeguard in publish-post.mjs.
  if (ATPROTO_PUBLICATION_URI) {
    const expectedDid = ATPROTO_PUBLICATION_URI.match(/^at:\/\/([^/]+)/)?.[1]
    if (expectedDid && expectedDid !== session.did) {
      console.error(
        `\n❌ Refusing to run: authenticated as ${session.handle} (${session.did})`,
      )
      console.error(
        `   but ATPROTO_PUBLICATION_URI is owned by ${expectedDid}.`,
      )
      process.exit(1)
    }
  }

  console.log('\n🔍 Listing existing site.standard.document records...')
  const { records } = await client.list(standard.document.main, { limit: 100 })
  console.log(`  Found ${records.length} record(s)`)

  const toMigrate = []
  const skipped = []

  for (const record of records) {
    const path = record.value.path
    if (typeof path === 'string' && path.startsWith(OLD_PREFIX)) {
      toMigrate.push(record)
    } else {
      skipped.push({ uri: record.uri, path })
    }
  }

  console.log(`\n  To migrate: ${toMigrate.length}`)
  console.log(`  Skipped:    ${skipped.length}`)

  for (const r of skipped) {
    console.log(`    · ${r.uri} (path: ${JSON.stringify(r.path)})`)
  }

  if (toMigrate.length === 0) {
    console.log('\nNothing to do.')
    return
  }

  console.log('\n📋 Planned changes:\n')
  for (const record of toMigrate) {
    const slug = record.value.path.slice(OLD_PREFIX.length)
    const newPath = `${NEW_PREFIX}${slug}`
    console.log(`  ${record.uri}`)
    console.log(`    ${record.value.path}  →  ${newPath}`)
  }

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to write changes.')
    return
  }

  console.log('\n📤 Applying changes...\n')
  let updated = 0
  let failed = 0
  for (const record of toMigrate) {
    const rkey = record.uri.split('/').pop()
    const slug = record.value.path.slice(OLD_PREFIX.length)
    const newPath = `${NEW_PREFIX}${slug}`

    // Preserve all existing fields; only path and updatedAt change.
    const next = {
      ...record.value,
      path: newPath,
      updatedAt: new Date().toISOString(),
    }

    try {
      const result = await client.put(standard.document.main, next, { rkey })
      console.log(`  ✓ ${result.uri}  path: ${newPath}`)
      updated++
    } catch (err) {
      console.error(`  ✗ ${record.uri}  ${err.message}`)
      failed++
    }
  }

  console.log(`\n✅ Done. Updated ${updated}, failed ${failed}.`)
  if (failed > 0) process.exit(1)
}
