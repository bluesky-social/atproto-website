#!/usr/bin/env node

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '../src/app/[locale]/blog')

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function main() {
  console.log('\n📝 Create a new blog post\n')

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

  const date = formatDate(new Date())

  rl.close()

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
}

# ${title}

Start writing your post here...
`
  fs.writeFileSync(path.join(postDir, 'en.mdx'), mdxContent)

  // Update blog/page.tsx with new post entry
  const blogIndexPath = path.join(BLOG_DIR, 'page.tsx')
  let blogIndex = fs.readFileSync(blogIndexPath, 'utf-8')

  const newPostEntry = `  {
    slug: '${slug}',
    title: '${title.replace(/'/g, "\\'")}',
    description: '${description.replace(/'/g, "\\'")}',
    date: '${date}',
    author: '${authorName.replace(/'/g, "\\'")}',
  },`

  // Insert after "const posts = ["
  blogIndex = blogIndex.replace(
    /const posts = \[/,
    `const posts = [\n${newPostEntry}`
  )

  fs.writeFileSync(blogIndexPath, blogIndex)

  console.log(`
✅ Blog post created!

Files created:
  - src/app/[locale]/blog/${slug}/page.tsx
  - src/app/[locale]/blog/${slug}/en.mdx

Next steps:
  1. Edit src/app/[locale]/blog/${slug}/en.mdx to write your post
  2. Run 'npm run dev' to preview at http://localhost:3000/blog/${slug}
`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
