#!/usr/bin/env node

/**
 * One-off migration: backfills `contributors` and `bskyPostRef` on
 * existing site.standard.document records, and normalizes MDX
 * `blueskyPostUrl` values to DID form.
 *
 *   npm run blog migrate-contributors-and-refs            # dry run
 *   npm run blog migrate-contributors-and-refs -- --apply # write
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Client } from '@atproto/lex'
import { PasswordSession } from '@atproto/lex-password-session'
import * as siteModule from '../src/lexicons/site.ts'
import authors from '../src/lib/authors.json' with { type: 'json' }
import { parseBskyUrl } from './lib/parseBskyUrl.mjs'
import { resolveBskyPostRef } from './lib/resolveBskyPostRef.mjs'
import { buildContributors } from './lib/buildContributors.mjs'

const { standard } = siteModule.default ?? siteModule
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '../src/app/[locale]/blog')

export async function main(...args) {
  const apply = args.includes('--apply')
  const mode = apply ? 'APPLY' : 'DRY-RUN'

  const { ATPROTO_HANDLE, ATPROTO_APP_PASSWORD, ATPROTO_PDS_URL, ATPROTO_PUBLICATION_URI } =
    process.env

  if (!ATPROTO_HANDLE || !ATPROTO_APP_PASSWORD) {
    console.error('Error: Missing ATPROTO_HANDLE / ATPROTO_APP_PASSWORD in .env')
    process.exit(1)
  }

  const service = ATPROTO_PDS_URL || 'https://bsky.social'

  console.log(`\n🔧 Migrate contributors + bskyPostRef (${mode})\n`)
  console.log(`  Service: ${service}`)
  console.log(`  Handle:  ${ATPROTO_HANDLE}`)

  const session = await PasswordSession.create({
    service,
    identifier: ATPROTO_HANDLE,
    password: ATPROTO_APP_PASSWORD,
    onUpdated: () => {},
    onDeleted: () => {},
  })
  const client = new Client(session)
  console.log(`✓ Authenticated as ${session.handle} (${session.did})`)

  if (ATPROTO_PUBLICATION_URI) {
    const expectedDid = ATPROTO_PUBLICATION_URI.match(/^at:\/\/([^/]+)/)?.[1]
    if (expectedDid && expectedDid !== session.did) {
      console.error(
        `\n❌ Refusing to run: authenticated DID ${session.did} ≠ publication DID ${expectedDid}`,
      )
      process.exit(1)
    }
  }

  // (Walk + compute + apply implemented in Task 9.)
  console.log('\n(scaffold only; walk implemented in next task)')
}
