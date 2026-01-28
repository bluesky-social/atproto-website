#!/usr/bin/env node

/**
 * Publishes a blog post to AT Protocol as a standard.document.main record
 *
 * Usage:
 *   npm run publish-post <slug>
 *
 * Example:
 *   npm run publish-post welcome-to-the-blog
 *
 * Requirements:
 *   - ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in .env
 *   - Optionally ATPROTO_PUBLICATION_URI (falls back to https://atproto.com)
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Client } from '@atproto/lex'
import { PasswordSession } from '@atproto/lex-password-session'
import * as siteModule from '../src/lexicons/site.ts'
const { standard } = siteModule.default ?? siteModule

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '../src/app/[locale]/blog')
const SITE_URL = 'https://atproto.com'

/**
 * Parse the MDX file to extract header metadata and content
 */
function parseMdxFile(content) {
  // Match the header export: export const header = { ... }
  const headerMatch = content.match(
    /export\s+const\s+header\s*=\s*\{([^}]+)\}/s
  )

  if (!headerMatch) {
    throw new Error('Could not find header export in MDX file')
  }

  // Parse the header object (simple key-value extraction)
  const headerStr = headerMatch[1]
  const header = {}

  // Extract title
  const titleMatch = headerStr.match(/title:\s*['"](.+?)['"]/s)
  if (titleMatch) header.title = titleMatch[1]

  // Extract description
  const descMatch = headerStr.match(/description:\s*['"](.+?)['"]/s)
  if (descMatch) header.description = descMatch[1]

  // Extract date
  const dateMatch = headerStr.match(/date:\s*['"](.+?)['"]/s)
  if (dateMatch) header.date = dateMatch[1]

  // Extract markdown content (everything after the header export)
  const contentStart = content.indexOf(headerMatch[0]) + headerMatch[0].length
  const markdownContent = content.slice(contentStart).trim()

  // Create plain text version (strip markdown syntax)
  const textContent = markdownContent
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/^-\s+/gm, '• ') // Convert list markers
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim()

  return { header, markdownContent, textContent }
}

/**
 * Parse a date string like "Jan 20, 2026" to ISO format
 */
function parseDate(dateStr) {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    // If parsing fails, use current date
    return new Date().toISOString()
  }
  return date.toISOString()
}

async function main() {
  const slug = process.argv[2]

  if (!slug) {
    console.error('Usage: npm run publish-post <slug>')
    console.error('Example: npm run publish-post welcome-to-the-blog')
    process.exit(1)
  }

  // Load environment variables
  const { ATPROTO_HANDLE, ATPROTO_APP_PASSWORD, ATPROTO_PDS_URL, ATPROTO_PUBLICATION_URI } =
    process.env

  if (!ATPROTO_HANDLE || !ATPROTO_APP_PASSWORD) {
    console.error('Error: Missing required environment variables.')
    console.error('Please set ATPROTO_HANDLE and ATPROTO_APP_PASSWORD in your .env file.')
    process.exit(1)
  }

  const service = ATPROTO_PDS_URL || 'https://bsky.social'

  // Read the post
  const postDir = path.join(BLOG_DIR, slug)
  const mdxPath = path.join(postDir, 'en.mdx')

  if (!fs.existsSync(mdxPath)) {
    console.error(`Error: Post not found: ${slug}`)
    console.error(`Expected file: ${mdxPath}`)
    process.exit(1)
  }

  console.log(`\n📝 Publishing post: ${slug}\n`)

  const mdxContent = fs.readFileSync(mdxPath, 'utf-8')
  const { header, markdownContent, textContent } = parseMdxFile(mdxContent)

  console.log(`  Title: ${header.title}`)
  console.log(`  Date: ${header.date}`)
  console.log(`  Description: ${header.description?.slice(0, 50)}...`)

  // Authenticate using PasswordSession
  console.log('\n🔐 Authenticating...')

  const session = await PasswordSession.create({
    service,
    identifier: ATPROTO_HANDLE,
    password: ATPROTO_APP_PASSWORD,
    onUpdated: () => {},
    onDeleted: () => {},
  })

  const client = new Client(session)

  console.log(`✓ Authenticated as ${session.handle}`)

  // Determine the site reference
  const siteRef = ATPROTO_PUBLICATION_URI || SITE_URL
  if (!ATPROTO_PUBLICATION_URI) {
    console.log(`\n⚠️  No ATPROTO_PUBLICATION_URI set, using URL: ${SITE_URL}`)
  }

  // Check for existing document with same path
  const postPath = `/blog/${slug}`
  console.log('\n🔍 Checking for existing document...')

  const existingRecords = await client.list(standard.document.main, { limit: 100 })

  const existingRecord = existingRecords.records.find((r) => r.value.path === postPath)
  if (existingRecord) {
    console.log(`  Found existing record: ${existingRecord.uri}`)
  }

  let documentUri

  if (existingRecord) {
    // Update existing record
    console.log('\n📤 Updating existing document...')

    const rkey = existingRecord.uri.split('/').pop()

    const result = await client.put(
      standard.document.main,
      {
        site: siteRef,
        title: header.title,
        description: header.description,
        path: postPath,
        textContent: textContent,
        publishedAt: parseDate(header.date),
        updatedAt: new Date().toISOString(),
      },
      { rkey }
    )

    documentUri = result.uri
    console.log('\n✅ Document updated successfully!')
    console.log(`   AT-URI: ${result.uri}`)
    console.log(`   CID: ${result.cid}`)
  } else {
    // Create new record
    console.log('\n📤 Creating document record...')

    const result = await client.create(standard.document.main, {
      site: siteRef,
      title: header.title,
      description: header.description,
      path: postPath,
      textContent: textContent,
      publishedAt: parseDate(header.date),
    })

    documentUri = result.uri
    console.log('\n✅ Document published successfully!')
    console.log(`   AT-URI: ${result.uri}`)
    console.log(`   CID: ${result.cid}`)
  }

  console.log(`\n   Canonical URL: ${SITE_URL}${postPath}`)

  // Save the AT-URI back to the MDX file for verification
  let updatedMdx = fs.readFileSync(mdxPath, 'utf-8')

  // Check if atUri already exists in header
  if (updatedMdx.match(/atUri:\s*['"]/)) {
    // Update existing atUri
    updatedMdx = updatedMdx.replace(
      /atUri:\s*['"].*?['"]/,
      `atUri: '${documentUri}'`
    )
  } else {
    // Add atUri to header (after the opening brace)
    updatedMdx = updatedMdx.replace(
      /export\s+const\s+header\s*=\s*\{/,
      `export const header = {\n  atUri: '${documentUri}',`
    )
  }

  fs.writeFileSync(mdxPath, updatedMdx)
  console.log(`\n📎 Saved AT-URI to ${path.basename(mdxPath)}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
