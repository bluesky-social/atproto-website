import { describe, it, expect } from 'vitest'
import { parseGitStatus, branchNameFor, isValidBranchName } from './git.mjs'

describe('parseGitStatus', () => {
  it('reports a clean tree', () => {
    expect(parseGitStatus('')).toEqual({ dirty: false, files: [] })
    expect(parseGitStatus('\n  \n')).toEqual({ dirty: false, files: [] })
  })

  it('lists modified, staged, and untracked paths', () => {
    const out = [' M src/a.ts', 'M  src/b.ts', '?? scratch.txt'].join('\n')
    expect(parseGitStatus(out)).toEqual({
      dirty: true,
      files: ['src/a.ts', 'src/b.ts', 'scratch.txt'],
    })
  })

  it('reports the destination path for renames', () => {
    expect(parseGitStatus('R  old/a.ts -> new/a.ts')).toEqual({
      dirty: true,
      files: ['new/a.ts'],
    })
  })

  it('counts untracked files as dirty', () => {
    // Deliberate: an untracked stray file travels to the new branch and can end
    // up in the post's PR.
    expect(parseGitStatus('?? notes.md').dirty).toBe(true)
  })
})

describe('branchNameFor', () => {
  it('names blog branches from the slug', () => {
    expect(branchNameFor('blog', { slug: 'going-off-protocol' })).toBe(
      'blog-going-off-protocol',
    )
  })

  it('names podcast branches from the publish date', () => {
    // Matches names already in use: off-protocol-2026-07-23.
    expect(
      branchNameFor('podcast', {
        slug: '2026-07-23-livestream-protocolly-atmoseed',
        pubDate: '2026-07-23T16:38:42.556Z',
      }),
    ).toBe('off-protocol-2026-07-23')
  })

  it('falls back to the slug when the publish date is unusable', () => {
    expect(branchNameFor('podcast', { slug: 'my-ep', pubDate: '' })).toBe(
      'off-protocol-my-ep',
    )
    expect(branchNameFor('podcast', { slug: 'my-ep', pubDate: 'nonsense' })).toBe(
      'off-protocol-my-ep',
    )
  })
})

describe('isValidBranchName', () => {
  it('accepts ordinary names', () => {
    for (const name of ['blog-my-post', 'off-protocol-2026-07-28', 'fix/typo']) {
      expect(isValidBranchName(name), name).toBe(true)
    }
  })

  it('rejects names git would refuse or a shell might mangle', () => {
    for (const name of [
      '',
      'has space',
      'tab\there',
      'a..b',
      'a~b',
      'a^b',
      'a:b',
      'a?b',
      'a*b',
      'a[b',
      'a\\b',
      'a@{b',
      '-leading',
      '/leading',
      '.leading',
      'trailing/',
      'trailing.',
      'thing.lock',
    ]) {
      expect(isValidBranchName(name), name).toBe(false)
    }
  })
})
