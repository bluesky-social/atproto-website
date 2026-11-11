import { describe, it, expect } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { blogPageTsx } from '@/lib/studio/templates'

// Every blog post's page.tsx must be the scaffolded template, byte for byte.
// Metadata belongs in the en.mdx header only; a hand-written page.tsx that
// repeats the date, tags or URL drifts silently when the header changes.
// To change what every post renders, change blogPageTsx() (and
// scripts/new-blog-post.mjs) and regenerate — don't customize one post.

const BLOG_DIR = path.resolve(__dirname, '../app/[locale]/blog')

const postDirs = fs
  .readdirSync(BLOG_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'topic')
  .filter((d) => fs.existsSync(path.join(BLOG_DIR, d.name, 'en.mdx')))
  .map((d) => d.name)

describe('blog post page.tsx', () => {
  it('finds blog posts to check', () => {
    expect(postDirs.length).toBeGreaterThan(10)
  })

  it.each(postDirs)('%s uses the standard template', (slug) => {
    const source = fs.readFileSync(
      path.join(BLOG_DIR, slug, 'page.tsx'),
      'utf-8',
    )
    expect(source).toBe(blogPageTsx())
  })
})
