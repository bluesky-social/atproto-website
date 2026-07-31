#!/usr/bin/env node

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { parseCreateArgs } from './lib/parseCreateArgs.mjs'
import { createPublishFn } from './lib/createPublishFn.mjs'
import { smartText } from '../src/mdx/smartText.mjs'
import { gitState, createBranch, branchNameFor } from '../src/lib/git.mjs'
import { slugify } from '../src/lib/slugs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '../src/app/[locale]/blog')
const knownAuthors = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/lib/authors.json'), 'utf-8')
)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

async function checkGitStatus() {
  let state
  try {
    state = await gitState()
  } catch {
    console.error('Error: Failed to check git status. Are you in a git repository?')
    process.exit(1)
  }
  if (state.dirty) {
    console.error(
      `⚠️ You have uncommitted changes on ${state.branch}. Please commit or stash your work and then get back to blogging.`,
    )
    process.exit(1)
  }
  const answer = await question('Create a new branch from origin/main? (Y/n): ')
  return answer.trim().toLowerCase() !== 'n'
}

// Prompts for the branch name, defaulting to the same `blog-<slug>` the studio
// suggests, then creates it from origin/main. Shares one implementation with the
// studio so the two tools can't drift.
async function makeBranch(slug) {
  const suggested = branchNameFor('blog', { slug })
  const answer = (await question(`Branch name (${suggested}): `)).trim()
  const name = answer || suggested
  console.log(`\nFetching origin/main and creating ${name}...`)
  try {
    await createBranch(name)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
  return name
}

export async function main(...args) {
  const { noSsite, unknownFlags } = parseCreateArgs(args)
  if (unknownFlags.length) {
    console.warn(
      `⚠️  Ignoring unrecognized option(s): ${unknownFlags.join(', ')}`,
    )
  }

  console.log('\n📝 Create a new blog post\n')

  const shouldCreateBranch = await checkGitStatus()

  const title = smartText(await question('Title: '))
  if (!title.trim()) {
    console.error('Error: Title is required')
    process.exit(1)
  }

  const suggestedSlug = slugify(title)
  const slugInput = await question(`Slug (${suggestedSlug}): `)
  const slug = slugInput.trim() || suggestedSlug

  const description = smartText(await question('Description: '))
  if (!description.trim()) {
    console.error('Error: Description is required')
    process.exit(1)
  }

  const author = await question('Author (AT Protocol Team): ')
  const authorName = author.trim() || 'AT Protocol Team'

  let authorDid = knownAuthors[authorName] || null
  if (!authorDid && authorName !== 'AT Protocol Team') {
    const didInput = await question(`No DID found for "${authorName}". Bluesky DID (leave blank to skip): `)
    const didValue = didInput.trim()
    if (didValue) {
      authorDid = didValue
      // Save to authors.json for future posts
      knownAuthors[authorName] = didValue
      const authorsPath = path.join(__dirname, '../src/lib/authors.json')
      fs.writeFileSync(authorsPath, JSON.stringify(knownAuthors, null, 2) + '\n')
      console.log(`\n✅ Added "${authorName}" to authors.json\n`)
    }
  }

  const defaultDate = formatDate(new Date())
  const dateInput = await question(`Publish date (${defaultDate}): `)
  const date = dateInput.trim() || defaultDate

  rl.close()

  let branchName
  if (shouldCreateBranch) {
    branchName = await makeBranch(slug)
  }

  // Create directory
  const postDir = path.join(BLOG_DIR, slug)
  if (fs.existsSync(postDir)) {
    console.error(`Error: Directory already exists: ${postDir}`)
    process.exit(1)
  }
  fs.mkdirSync(postDir, { recursive: true })

  // Create page.tsx
  // No title/description here: the route reads them from the MDX header, so
  // page.tsx can't drift from the content. en.mdx is imported statically because
  // blog posts aren't translated and the module edge is what makes content edits
  // hot-reload.
  const pageContent = `import { Page } from '@/components/Page'
import { mdxRouteMetadata } from '@/lib/localizedMdx'
import * as content from './en.mdx'

// Metadata comes from the MDX header (see mdx.d.ts). en.mdx is imported
// statically — not translated, and the module edge is what makes content
// edits hot-reload.

export function generateMetadata() {
  return mdxRouteMetadata(content)
}

export default function BlogPost() {
  return <Page {...content} />
}
`
  fs.writeFileSync(path.join(postDir, 'page.tsx'), pageContent)

  // Create en.mdx
  const mdxContent = `export const header = {
  title: '${title.replace(/'/g, "\\'")}',
  description: '${description.replace(/'/g, "\\'")}',
  date: '${date}',
  author: '${authorName.replace(/'/g, "\\'")}',
}

Start writing your post here...
`
  fs.writeFileSync(path.join(postDir, 'en.mdx'), mdxContent)

  // Update src/lib/posts.ts with new post entry
  const postsFilePath = path.join(__dirname, '../src/lib/posts.ts')
  let postsFile = fs.readFileSync(postsFilePath, 'utf-8')

  const newPostEntry = `  {
    slug: '${slug}',
    title: '${title.replace(/'/g, "\\'")}',
    description: '${description.replace(/'/g, "\\'")}',
    date: '${date}',
    author: '${authorName.replace(/'/g, "\\'")}',
  },`

  // Insert after "export const posts: BlogPost[] = ["
  postsFile = postsFile.replace(
    /export const posts: BlogPost\[\] = \[/,
    `export const posts: BlogPost[] = [\n${newPostEntry}`
  )

  fs.writeFileSync(postsFilePath, postsFile)

  console.log(`
✅ Blog post created!

Files created:
  - src/app/[locale]/blog/${slug}/page.tsx
  - src/app/[locale]/blog/${slug}/en.mdx
${branchName ? `\nBranch: ${branchName} (from origin/main)` : ''}
Next steps:
  1. Edit src/app/[locale]/blog/${slug}/en.mdx to write your post
  2. Run 'npm run dev' to preview at http://localhost:3000/blog/${slug}
`)

  const { maybePublish } = await import('./lib/maybePublish.mjs')
  await maybePublish(slug, { noSsite, publishFn: createPublishFn() })
}

