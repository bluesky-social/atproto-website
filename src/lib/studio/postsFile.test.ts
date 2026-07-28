import { describe, it, expect } from 'vitest'
import {
  hasEntry,
  prependEntry,
  updateEntryBySlug,
  removeEntryBySlug,
} from './postsFile'

const SRC = `export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author?: string
}

export const posts: BlogPost[] = [
  {
    slug: 'first-post',
    title: 'First',
    description: 'desc one',
    date: 'June 1, 2026',
    author: 'Jim Ray',
  },
]
`

const ENTRY = {
  slug: 'new-post',
  title: 'New',
  description: 'desc two',
  date: 'June 2, 2026',
  author: 'Jim Ray',
}

describe('prependEntry', () => {
  it('inserts a new entry at the top of the array', () => {
    const out = prependEntry(SRC, ENTRY)
    const firstSlug = out.indexOf("slug: 'new-post'")
    const oldSlug = out.indexOf("slug: 'first-post'")
    expect(firstSlug).toBeGreaterThan(-1)
    expect(firstSlug).toBeLessThan(oldSlug)
  })
  it('throws when the anchor is missing', () => {
    expect(() => prependEntry('const x = []\n', ENTRY)).toThrow(/anchor/i)
  })
})

describe('updateEntryBySlug', () => {
  it('updates the matching entry fields', () => {
    const out = updateEntryBySlug(SRC, 'first-post', {
      slug: 'first-post',
      title: 'First (edited)',
      description: 'desc one',
      date: 'June 1, 2026',
      author: 'Jim Ray',
    })
    expect(out).toContain("title: 'First (edited)'")
    expect(out).not.toContain("title: 'First',")
  })
  it('throws when the slug is not present', () => {
    expect(() => updateEntryBySlug(SRC, 'nope', ENTRY)).toThrow(/not found/i)
  })
})

describe('removeEntryBySlug', () => {
  it('removes the matching entry', () => {
    const out = removeEntryBySlug(SRC, 'first-post')
    expect(out).not.toContain("slug: 'first-post'")
    expect(hasEntry(out, 'first-post')).toBe(false)
  })
  it('is a no-op when the slug is absent', () => {
    expect(removeEntryBySlug(SRC, 'nope')).toBe(SRC)
  })
})
