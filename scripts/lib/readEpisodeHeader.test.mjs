// scripts/lib/readEpisodeHeader.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readEpisodeHeader } from './readEpisodeHeader.mjs'

const header = (body) => `export const header = {\n${body}\n}\n\nShow notes.\n`

test('reads the four fields the transcribe script needs', () => {
  const h = readEpisodeHeader(
    header(`  episodeNumber: 9,
  title: '“Policy Without Tools Is Just Poetry”',
  hosts: ['Alex Garnett'],
  guests: ['Juliet Shen', 'Cassidy James'],
  audioUrl: 'https://media.atproto.com/off-protocol/x/ep.mp3',
  hasTranscript: true,`),
  )
  assert.deepEqual(h, {
    audioUrl: 'https://media.atproto.com/off-protocol/x/ep.mp3',
    hosts: ['Alex Garnett'],
    guests: ['Juliet Shen', 'Cassidy James'],
    hasTranscript: true,
  })
})

test('defaults missing fields to empty values', () => {
  assert.deepEqual(readEpisodeHeader(header(`  title: 'x',`)), {
    audioUrl: '',
    hosts: [],
    guests: [],
    hasTranscript: false,
  })
})

test('decodes escaped quotes and double-quoted strings', () => {
  const h = readEpisodeHeader(
    header(`  hosts: ['Jim O\\'Brien', "Ada \\"A\\" Lovelace"],`),
  )
  assert.deepEqual(h.hosts, ["Jim O'Brien", 'Ada "A" Lovelace'])
})

test('ignores a field name that appears inside another string', () => {
  const h = readEpisodeHeader(
    header(`  description: 'hosts: [nobody] and hasTranscript: true',
  hosts: ['Jim Ray'],`),
  )
  assert.deepEqual(h.hosts, ['Jim Ray'])
  assert.equal(h.hasTranscript, false)
})

test('ignores text after the header object', () => {
  const src = `${header(`  title: 'x',`)}\nhosts: ['Not A Host']\n`
  assert.deepEqual(readEpisodeHeader(src).hosts, [])
})

test('throws when the file has no header', () => {
  assert.throws(
    () => readEpisodeHeader('# just markdown'),
    /export const header/,
  )
})

// Contract: on every real episode, agree with the site's own parser, which is
// TypeScript. Runs under `npm run test:scripts` (node --import tsx).
test('matches the canonical TypeScript parser on every episode', async () => {
  const mdx = await import('../../src/lib/studio/mdxHeader.ts')
  const ep = await import('../../src/lib/studio/episodeHeader.ts')
  const { parseMdxFile } = mdx.default ?? mdx
  const { getEpisodeFields } = ep.default ?? ep

  const dir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../src/app/[locale]/off-protocol',
  )
  const files = fs
    .readdirSync(dir)
    .map((s) => path.join(dir, s, 'en.mdx'))
    .filter((f) => fs.existsSync(f))
  assert.ok(files.length > 10, `expected real episodes, found ${files.length}`)

  for (const f of files) {
    const src = fs.readFileSync(f, 'utf-8')
    const { audioUrl, hosts, guests, hasTranscript } = getEpisodeFields(
      parseMdxFile(src),
    )
    assert.deepEqual(
      readEpisodeHeader(src),
      { audioUrl, hosts, guests, hasTranscript },
      f,
    )
  }
})
