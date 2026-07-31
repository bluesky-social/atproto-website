import { describe, it, expect } from 'vitest'
import {
  parseGitStatus,
  branchNameFor,
  isValidBranchName,
  gitState,
  createBranch,
} from './git.mjs'

/** Records calls and replies from a script of canned outputs. */
function fakeRun(replies: Record<string, string | Error>) {
  const calls: string[][] = []
  const run = async (command: string, args: string[]) => {
    calls.push([command, ...args])
    const reply = replies[args.join(' ')]
    if (reply instanceof Error) throw reply
    return reply ?? ''
  }
  return { run, calls }
}

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

describe('gitState', () => {
  it('reports the current branch and a clean tree', async () => {
    const { run } = fakeRun({
      'branch --show-current': 'main\n',
      'status --porcelain': '',
    })
    expect(await gitState({ run })).toEqual({
      branch: 'main',
      dirty: false,
      files: [],
    })
  })

  it('reports dirty files', async () => {
    const { run } = fakeRun({
      'branch --show-current': 'typography\n',
      'status --porcelain': ' M README.md\n?? scratch.txt',
    })
    expect(await gitState({ run })).toEqual({
      branch: 'typography',
      dirty: true,
      files: ['README.md', 'scratch.txt'],
    })
  })
})

describe('createBranch', () => {
  it('fetches origin/main before checking out, in that order', async () => {
    const { run, calls } = fakeRun({})
    await createBranch('blog-my-post', { run })
    expect(calls).toEqual([
      ['git', 'fetch', 'origin', 'main'],
      ['git', 'checkout', '-b', 'blog-my-post', 'origin/main'],
    ])
  })

  it('rejects an invalid name before running any command', async () => {
    const { run, calls } = fakeRun({})
    await expect(createBranch('bad name', { run })).rejects.toThrow(/invalid/i)
    expect(calls).toEqual([])
  })

  it('does not attempt checkout when the fetch fails', async () => {
    const err = Object.assign(new Error('exit 128'), {
      stderr: 'fatal: unable to access origin',
    })
    const { run, calls } = fakeRun({ 'fetch origin main': err })
    await expect(createBranch('blog-my-post', { run })).rejects.toThrow(
      /unable to access origin/,
    )
    expect(calls).toEqual([['git', 'fetch', 'origin', 'main']])
  })

  it('surfaces stderr when the checkout fails', async () => {
    const err = Object.assign(new Error('exit 128'), {
      stderr: "fatal: a branch named 'blog-dup' already exists",
    })
    const { run } = fakeRun({ 'checkout -b blog-dup origin/main': err })
    await expect(createBranch('blog-dup', { run })).rejects.toThrow(
      /already exists/,
    )
  })
})

describe('client-bundle safety', () => {
  // The studio editors are 'use client' and import from these. If any of them
  // reaches for a node: built-in — as gitNames did when the pure and effectful
  // helpers lived in one file — the webpack build fails and takes the dev
  // server with it. tsc cannot catch that; this can.
  //
  // Checks for `node:` specifically rather than banning imports outright: these
  // modules legitimately import each other. That means the check is not
  // transitive, so every client-safe module must be listed here.
  const CLIENT_SAFE = ['./gitNames.mjs', './slugs.mjs']

  for (const mod of CLIENT_SAFE) {
    it(`${mod} pulls in no node: built-ins`, async () => {
      const { readFileSync } = await import('node:fs')
      const src = readFileSync(new URL(mod, import.meta.url), 'utf-8')
      const nodeImports = src.match(/^\s*import\s.*['"]node:.*$/gm) ?? []
      expect(nodeImports).toEqual([])
    })
  }
})
