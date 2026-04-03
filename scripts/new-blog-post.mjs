#!/usr/bin/env node

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

async function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' }).trim()
    if (status) {
      const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim()
      console.error(`⚠️ You have uncommitted changes on ${branch}. Please commit or stash your work and then get back to blogging.`)
      process.exit(1)
    }
  } catch {
    console.error('Error: Failed to check git status. Are you in a git repository?')
    process.exit(1)
  }

  const answer = await question('Create a new branch from origin/main? (Y/n): ')
  return answer.trim().toLowerCase() !== 'n'
}

function createBranch(slug) {
  const branch = `blog-${slug}`
  try {
    console.log(`\nFetching latest from origin/main...`)
    execSync('git fetch origin main', { encoding: 'utf-8', stdio: 'inherit' })
    console.log(`Creating branch ${branch} from origin/main...`)
    execSync(`git checkout -b ${branch} origin/main`, { encoding: 'utf-8', stdio: 'inherit' })
  } catch {
    console.error(`Error: Failed to create branch "${branch}". Does it already exist?`)
    process.exit(1)
  }
}

async function main() {
  console.log('\n📝 Create a new blog post\n')

  const shouldCreateBranch = await checkGitStatus()

  const title = await question('Title: ')
  if (!title.trim()) {
    console.error('Error: Title is required')
    process.exit(1)
  }

  const suggestedSlug = slugify(title)
  const slugInput = await question(`Slug (${suggestedSlug}): `)
  const slug = slugInput.trim() || suggestedSlug

  const description = await question('Description: ')
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

  if (shouldCreateBranch) {
    createBranch(slug)
  }

  // Create directory
  const postDir = path.join(BLOG_DIR, slug)
  if (fs.existsSync(postDir)) {
    console.error(`Error: Directory already exists: ${postDir}`)
    process.exit(1)
  }
  fs.mkdirSync(postDir, { recursive: true })

  // Create page.tsx
  const pageContent = `import { Page } from '@/components/Page'

export const metadata = {
  title: '${title.replace(/'/g, "\\'")}',
  description: '${description.replace(/'/g, "\\'")}',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(\`./\${params.locale}.mdx\`)
  } catch (error) {
    Content = await import(\`./en.mdx\`)
  }
  return <Page {...Content} />
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

# ${title}

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
${shouldCreateBranch ? `\nBranch: blog-${slug} (from origin/main)` : ''}
Next steps:
  1. Edit src/app/[locale]/blog/${slug}/en.mdx to write your post
  2. Run 'npm run dev' to preview at http://localhost:3000/blog/${slug}
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
