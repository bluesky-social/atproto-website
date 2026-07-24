import { describe, it, expect } from 'vitest'
import { studioPaths, episodePaths, r2Config, audioObjectKey } from './paths'

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

describe('audioObjectKey', () => {
  it('date-stamps the directory to match the existing bucket layout', () => {
    expect(audioObjectKey('roost-v1-juliet-shen', '2026-06-16T12:00:00.000Z')).toBe(
      'off-protocol/2026-06-16-roost-v1-juliet-shen/roost-v1-juliet-shen.mp3',
    )
  })

  it('falls back to an undated directory when pubDate is missing', () => {
    expect(audioObjectKey('my-ep', '')).toBe('off-protocol/my-ep/my-ep.mp3')
    expect(audioObjectKey('my-ep', 'nonsense')).toBe('off-protocol/my-ep/my-ep.mp3')
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
