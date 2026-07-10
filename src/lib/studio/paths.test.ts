import { describe, it, expect } from 'vitest'
import { studioPaths, episodePaths, r2Config } from './paths'

describe('studioPaths', () => {
  it('resolves blog/posts/authors paths under cwd', () => {
    const p = studioPaths()
    expect(p.blogDir.endsWith('src/app/[locale]/blog')).toBe(true)
    expect(p.postsFile.endsWith('src/lib/posts.ts')).toBe(true)
    expect(p.authorsFile.endsWith('src/lib/authors.json')).toBe(true)
  })
})

describe('episodePaths', () => {
  it('resolves the off-protocol dir and episodes.ts under cwd', () => {
    const p = episodePaths()
    expect(p.podcastDir.endsWith('src/app/[locale]/off-protocol')).toBe(true)
    expect(p.episodesFile.endsWith('src/lib/episodes.ts')).toBe(true)
  })
})

describe('r2Config', () => {
  it('reads config from env', () => {
    const prev = { ...process.env }
    process.env.CLOUDFLARE_API_TOKEN = 't'
    process.env.CLOUDFLARE_ACCOUNT_ID = 'a'
    process.env.R2_BUCKET = 'b'
    process.env.R2_PUBLIC_BASE = 'https://media.atproto.com'
    try {
      expect(r2Config()).toEqual({
        token: 't',
        accountId: 'a',
        bucket: 'b',
        publicBase: 'https://media.atproto.com',
      })
    } finally {
      process.env = prev
    }
  })

  it('throws when a value is missing', () => {
    const prev = { ...process.env }
    delete process.env.R2_BUCKET
    delete process.env.CLOUDFLARE_API_TOKEN
    try {
      expect(() => r2Config()).toThrow(/R2/)
    } finally {
      process.env = prev
    }
  })
})
