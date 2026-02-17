#!/usr/bin/env node

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '../src/app/[locale]/blog')
const POSTS_FILE = path.join(__dirname, '../src/lib/posts.ts')
const PAGE_SIZE = 10

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function parsePosts() {
  const content = fs.readFileSync(POSTS_FILE, 'utf-8')
  const posts = []
  const entryRegex = /\{[^}]*slug:\s*'([^']*)'[^}]*title:\s*'([^']*)'[^}]*date:\s*'([^']*)'[^}]*\}/gs
  let match
  while ((match = entryRegex.exec(content)) !== null) {
    posts.push({ slug: match[1], title: match[2], date: match[3] })
  }
  return posts
}

function displayPage(posts, offset) {
  const page = posts.slice(offset, offset + PAGE_SIZE)
  if (page.length === 0) {
    console.log('\nNo more posts.\n')
    return false
  }

  console.log('')
  page.forEach((post, i) => {
    const num = offset + i + 1
    console.log(`  ${String(num).padStart(3)}. ${post.title} (${post.date})`)
  })
  console.log('')

  return true
}

function removePostEntry(slug) {
  const content = fs.readFileSync(POSTS_FILE, 'utf-8')
  const entryRegex = new RegExp(
    `\\s*\\{[^}]*slug:\\s*'${slug}'[^}]*\\},?\\n?`,
    's'
  )
  const updated = content.replace(entryRegex, '\n')
  fs.writeFileSync(POSTS_FILE, updated)
}

function removePostDirectory(slug) {
  const postDir = path.join(BLOG_DIR, slug)
  if (fs.existsSync(postDir)) {
    fs.rmSync(postDir, { recursive: true, force: true })
    return true
  }
  return false
}

async function main() {
  const posts = parsePosts()

  if (posts.length === 0) {
    console.log('\nNo blog posts found.\n')
    process.exit(0)
  }

  console.log('\n🗑️  Remove a blog post\n')

  let offset = 0

  while (true) {
    const hasMore = displayPage(posts, offset)
    const end = Math.min(offset + PAGE_SIZE, posts.length)
    const moreAvailable = end < posts.length

    const options = [`${offset + 1}-${end}`]
    if (moreAvailable) options.push("'m' for more")
    options.push("'q' to quit")

    const input = await question(`Select a post to remove (${options.join(', ')}): `)
    const trimmed = input.trim().toLowerCase()

    if (trimmed === 'q') {
      console.log('\nCancelled.\n')
      break
    }

    if (trimmed === 'm') {
      if (moreAvailable) {
        offset += PAGE_SIZE
      } else {
        console.log('\nNo more posts to show.')
      }
      continue
    }

    const num = parseInt(trimmed, 10)
    if (isNaN(num) || num < 1 || num > posts.length) {
      console.log(`\nInvalid selection. Enter a number between 1 and ${Math.min(end, posts.length)}.\n`)
      continue
    }

    const post = posts[num - 1]
    const confirm = await question(
      `Remove '${post.title}'? This cannot be undone. (y/N): `
    )

    if (confirm.trim().toLowerCase() !== 'y') {
      console.log('\nCancelled.\n')
      break
    }

    removePostEntry(post.slug)
    const dirRemoved = removePostDirectory(post.slug)

    console.log(`\n✅ Blog post removed!\n`)
    console.log(`  Removed from src/lib/posts.ts`)
    if (dirRemoved) {
      console.log(`  Deleted src/app/[locale]/blog/${post.slug}/`)
    } else {
      console.log(`  Directory src/app/[locale]/blog/${post.slug}/ not found (already removed?)`)
    }
    console.log('')
    break
  }

  rl.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
