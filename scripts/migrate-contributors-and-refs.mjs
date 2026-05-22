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
import { resolveBskyPostRef } from './lib/resolveBskyPostRef.mjs'
import { buildContributors } from './lib/buildContributors.mjs'

const { standard } = siteModule.default ?? siteModule
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '../src/app/[locale]/blog')

function readHeaderField(content, field) {
  const re = new RegExp(`^\\s*${field}:\\s*['"\`]([^'"\`]*)['"\`]`, 'm')
  return content.match(re)?.[1]
}

function listBlogPosts() {
  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true })
  const posts = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const mdxPath = path.join(BLOG_DIR, entry.name, 'en.mdx')
    if (!fs.existsSync(mdxPath)) continue
    const content = fs.readFileSync(mdxPath, 'utf-8')
    const standardSiteUri = readHeaderField(content, 'standardSiteUri')
    if (!standardSiteUri) continue
    posts.push({
      slug: entry.name,
      mdxPath,
      content,
      standardSiteUri,
      author: readHeaderField(content, 'author'),
      blueskyPostUrl: readHeaderField(content, 'blueskyPostUrl'),
    })
  }
  return posts
}

function normalizeBlueskyPostUrlInMdx(content, currentUrl, newUrl) {
  if (currentUrl === newUrl) return content
  return content.replace(
    `blueskyPostUrl: '${currentUrl}'`,
    `blueskyPostUrl: '${newUrl}'`,
  )
}

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

  const posts = listBlogPosts()
  console.log(`\n🔍 Walking blog MDX files: ${posts.length} with standardSiteUri\n`)

  // Fetch all our documents once and index by URI. publish-post.mjs and
  // migrate-paths.mjs both use this list-then-match pattern.
  const { records: docRecords } = await client.list(standard.document.main, {
    limit: 100,
  })
  const byUri = new Map(docRecords.map((r) => [r.uri, r]))

  const plans = []
  for (const post of posts) {
    if (!post.author) {
      throw new Error(`${post.slug}: MDX header missing 'author'`)
    }
    const existing = byUri.get(post.standardSiteUri)
    if (!existing) {
      throw new Error(
        `${post.slug}: standardSiteUri ${post.standardSiteUri} not found in PDS records`,
      )
    }
    const contributors = buildContributors(post.author, authors)

    let bskyPostRef = null
    let normalizedUrl = null
    if (post.blueskyPostUrl) {
      bskyPostRef = await resolveBskyPostRef(post.blueskyPostUrl)
      // bskyPostRef.uri is at://<did>/app.bsky.feed.post/<rkey>; build
      // the DID-form bsky.app URL from those components.
      const didMatch = bskyPostRef.uri.match(/^at:\/\/([^/]+)/)
      const bRkey = bskyPostRef.uri.split('/').pop()
      if (didMatch && bRkey) {
        normalizedUrl = `https://bsky.app/profile/${didMatch[1]}/post/${bRkey}`
      }
    }

    const rkey = post.standardSiteUri.split('/').pop()
    const next = {
      ...existing.value,
      contributors,
      ...(bskyPostRef ? { bskyPostRef } : {}),
      updatedAt: new Date().toISOString(),
    }

    plans.push({ post, rkey, existing: existing.value, next, normalizedUrl })
  }

  console.log('\n📋 Planned changes:\n')
  for (const p of plans) {
    console.log(`  ${p.post.slug}  (${p.rkey})`)
    console.log(`    contributors: ${JSON.stringify(p.next.contributors)}`)
    if (p.next.bskyPostRef) {
      console.log(`    bskyPostRef:  ${p.next.bskyPostRef.uri}`)
      console.log(`                  cid=${p.next.bskyPostRef.cid}`)
    } else {
      console.log(`    bskyPostRef:  (none — no blueskyPostUrl in MDX)`)
    }
    if (p.normalizedUrl && p.normalizedUrl !== p.post.blueskyPostUrl) {
      console.log(`    MDX URL:      ${p.post.blueskyPostUrl}`)
      console.log(`              →   ${p.normalizedUrl}`)
    }
    console.log('')
  }

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write changes.')
    return
  }

  // (Apply branch implemented in Task 10.)
  console.log('\n(--apply not yet wired; implemented in next task)')
}
