import { describe, it, expect } from 'vitest'
import { studioPaths } from './paths'

describe('studioPaths', () => {
  it('resolves blog/posts/authors paths under cwd', () => {
    const p = studioPaths()
    expect(p.blogDir.endsWith('src/app/[locale]/blog')).toBe(true)
    expect(p.postsFile.endsWith('src/lib/posts.ts')).toBe(true)
    expect(p.authorsFile.endsWith('src/lib/authors.json')).toBe(true)
  })
})
