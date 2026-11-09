import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { posts } from './posts'
import { blogTopics, normalizeBlogTags } from './blogTags.mjs'
import {
  getHeaderField,
  parseMdxFile,
  readHeaderTags,
} from './studio/mdxHeader'
import { extractSearchSections } from '../mdx/search.mjs'

// posts.ts copies each post's MDX header for the listing and feeds. Until it
// is generated from the headers, check every copied field for drift.
describe('blog listing metadata', () => {
  for (const field of ['title', 'description', 'date', 'author'] as const) {
    it(`matches the MDX header ${field} for every post`, () => {
      for (const post of posts) {
        const content = fs.readFileSync(
          path.join(
            process.cwd(),
            'src/app/[locale]/blog',
            post.slug,
            'en.mdx',
          ),
          'utf8',
        )
        expect(getHeaderField(parseMdxFile(content), field), post.slug).toBe(
          post[field] ?? '',
        )
      }
    })
  }
})

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
    }
  })
})

describe('blog topic vocabulary order and labels', () => {
  it('matches the approved topic list', () => {
    expect(blogTopics).toEqual([
      { id: 'news', label: 'News & Announcements' },
      { id: 'identity', label: 'Accounts & Auth' },
      { id: 'ai', label: 'AI' },
      { id: 'feeds', label: 'Feeds' },
      { id: 'governance', label: 'Governance' },
      { id: 'lexicons', label: 'Lexicons & Data Schemas' },
      { id: 'moderation', label: 'Moderation' },
      { id: 'sync', label: 'Network Data' },
      { id: 'sdks', label: 'SDKs & Tools' },
      { id: 'hosting', label: 'Self-Hosting' },
      { id: 'spaces', label: 'Spaces & Permissioned Data' },
    ])
  })

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

describe('normalizeBlogTags', () => {
  it('normalizes case and whitespace and removes duplicates', () => {
    expect(normalizeBlogTags([' Spaces ', 'spaces', 'IDENTITY'])).toEqual([
      'spaces',
      'identity',
    ])
  })

  it('treats a missing tags field as no tags', () => {
    expect(normalizeBlogTags(undefined)).toEqual([])
  })

  it('rejects data that is not an array of strings', () => {
    for (const invalid of [null, 'spaces', [1]])
      expect(() => normalizeBlogTags(invalid)).toThrow()
  })

  // Removed topics, and the old oauth query alias, are errors for authors.
  it('rejects IDs outside the vocabulary', () => {
    for (const tag of [
      'made-up',
      'tutorials',
      'ecosystem',
      'oauth',
      'roadmap',
      'grants',
    ])
      expect(() => normalizeBlogTags([tag]), tag).toThrow('Unknown blog tag')
  })
})
