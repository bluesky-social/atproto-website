import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { posts } from './posts'
import { blogTopics, normalizeBlogTags } from './blogTags.mjs'
import { parseMdxFile, readHeaderTags } from './studio/mdxHeader'
import { extractBlogTags, extractSearchSections } from '../mdx/search.mjs'

describe('blog archive tags', () => {
  it('covers every listed post and keeps listing and MDX metadata consistent', () => {
    for (const post of posts) {
      const file = path.join(
        process.cwd(),
        'src/app/[locale]/blog',
        post.slug,
        'en.mdx',
      )
      const content = fs.readFileSync(file, 'utf8')
      expect(normalizeBlogTags(post.tags), post.slug).toEqual(post.tags ?? [])
      expect(readHeaderTags(parseMdxFile(content)), post.slug).toEqual(
        post.tags ?? [],
      )
      expect(extractBlogTags(content), post.slug).toEqual(post.tags ?? [])
      expect(
        extractSearchSections(content, file).length,
        post.slug,
      ).toBeGreaterThan(0)
    }
  })
  it('rejects expressions in tags rather than executing them', () => {
    for (const tags of ['getTags()', "['spaces', ...other]", '[1]']) {
      const content = `export const header = { title: 'Example', tags: ${tags} }\n\nBody`
      expect(() => readHeaderTags(parseMdxFile(content))).toThrow()
      expect(() => extractBlogTags(content)).toThrow()
    }
  })
})

describe('blog topic vocabulary order and labels', () => {
  it('lists News & Announcements first', () => {
    expect(blogTopics[0].id).toBe('news')
  })

  it('lists the remaining topics alphabetically by label', () => {
    const rest = blogTopics.slice(1).map((topic) => topic.label)
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b)))
  })

  it('uses title case for every label', () => {
    for (const { label } of blogTopics)
      for (const word of label.split(' ').filter((w) => w !== '&'))
        expect(word[0], `${label}`).toBe(word[0].toUpperCase())
  })
})
