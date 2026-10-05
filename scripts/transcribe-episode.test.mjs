// scripts/transcribe-episode.test.mjs
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  transcribeEpisode,
  speakerTemplate,
  parseSpeakerConfig,
  isStubTranscript,
} from './transcribe-episode.mjs'

const STUB =
  '{/* Paste the episode transcript here, then flip hasTranscript: true in en.mdx. */}\n'

const EN_MDX = `export const header = {
  episodeNumber: 9,
  title: 'Test',
  hosts: ['Alex Garnett'],
  guests: ['Juliet Shen'],
  audioUrl: 'https://media.example/ep.mp3',
  hasShowNotes: true,
  hasTranscript: false,
}

Notes.
`

const RAW = {
  text: '',
  segments: [
    {
      speaker: 'Speaker 1',
      text: 'Hi, and welcome to another conversation.',
      start: 0,
      end: 1,
      words: [],
    },
    {
      speaker: 'Speaker 2',
      text: 'Congratulations on 1. 0.',
      start: 1,
      end: 2,
      words: [],
    },
    {
      speaker: 'Speaker 3',
      text: 'Thank you. Skilla is optional.',
      start: 2,
      end: 3,
      words: [],
    },
  ],
}

let root
let calls
let deps

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'transcribe-'))
  const ep = path.join(root, 'podcast', 'ep')
  fs.mkdirSync(ep, { recursive: true })
  fs.writeFileSync(path.join(ep, 'en.mdx'), EN_MDX)
  fs.writeFileSync(path.join(ep, 'transcript.mdx'), STUB)
  calls = { download: 0, mw: [] }
  deps = {
    podcastDir: path.join(root, 'podcast'),
    workDir: path.join(root, 'work'),
    log: () => {},
    download: async (url, dest) => {
      calls.download++
      assert.equal(url, 'https://media.example/ep.mp3')
      fs.writeFileSync(dest, 'mp3')
    },
    runMw: (args) => {
      calls.mw.push(args)
      fs.writeFileSync(args[args.indexOf('-o') + 1], JSON.stringify(RAW))
    },
  }
})

afterEach(() => fs.rmSync(root, { recursive: true, force: true }))

const work = (f) => path.join(root, 'work', 'ep', f)
const transcript = () =>
  fs.readFileSync(path.join(root, 'podcast', 'ep', 'transcript.mdx'), 'utf-8')
const fillSpeakers = (speakers, glossary = []) => {
  const cfg = JSON.parse(fs.readFileSync(work('speakers.json'), 'utf-8'))
  fs.writeFileSync(
    work('speakers.json'),
    JSON.stringify({ ...cfg, speakers, glossary }),
  )
}

// --- helpers --------------------------------------------------------------

test('isStubTranscript accepts the placeholder and blank files', () => {
  assert.equal(isStubTranscript(STUB), true)
  assert.equal(isStubTranscript('\n'), true)
  assert.equal(isStubTranscript(`${STUB}\n**Jim Ray:** Hi.\n`), false)
})

test('speakerTemplate lists each label with empty names, hints, and a sample', () => {
  const t = speakerTemplate(RAW.segments, {
    hosts: ['Alex Garnett'],
    guests: ['Juliet Shen'],
  })
  assert.deepEqual(t.speakers, {
    'Speaker 1': '',
    'Speaker 2': '',
    'Speaker 3': '',
  })
  assert.deepEqual(t.names, ['Alex Garnett', 'Juliet Shen'])
  assert.equal(t.samples['Speaker 2'], 'Congratulations on 1. 0.')
  assert.deepEqual(t.glossary, [])
})

test('speakerTemplate cuts samples to about 25 words', () => {
  const long = Array.from({ length: 40 }, (_, i) => `w${i}`).join(' ')
  const t = speakerTemplate([{ speaker: 'Speaker 1', text: long }], {
    hosts: [],
    guests: [],
  })
  assert.equal(t.samples['Speaker 1'].split(' ').length, 26) // 25 words + ellipsis
  assert.ok(t.samples['Speaker 1'].endsWith('…'))
})

test('speakerTemplate builds a sample from several short segments', () => {
  const t = speakerTemplate(
    [
      { speaker: 'Speaker 3', text: 'Thank you.' },
      { speaker: 'Speaker 2', text: 'Great.' },
      { speaker: 'Speaker 3', text: 'It is a true collaborative effort.' },
    ],
    { hosts: [], guests: [] },
  )
  assert.equal(
    t.samples['Speaker 3'],
    'Thank you. It is a true collaborative effort.',
  )
})

test('parseSpeakerConfig names every label without a name', () => {
  assert.throws(
    () =>
      parseSpeakerConfig({
        speakers: { 'Speaker 1': 'Jim Ray', 'Speaker 2': '', 'Speaker 3': ' ' },
      }),
    /Speaker 2, Speaker 3/,
  )
})

test('parseSpeakerConfig turns glossary pairs into whole-word regexes', () => {
  const { glossary } = parseSpeakerConfig({
    speakers: { 'Speaker 1': 'A' },
    glossary: [['Skilla', 'Scylla']],
  })
  const [pattern, replacement] = glossary[0]
  assert.equal(
    'Skilla and Skillas'.replace(pattern, replacement),
    'Scylla and Skillas',
  )
})

test('parseSpeakerConfig escapes regex characters in glossary terms', () => {
  const { glossary } = parseSpeakerConfig({
    speakers: { 'Speaker 1': 'A' },
    glossary: [['C++ coop', 'Coop']],
  })
  assert.equal('a C++ coop b'.replace(...glossary[0]), 'a Coop b')
})

// --- transcribeEpisode ----------------------------------------------------

test('first run downloads, transcribes, writes a speaker template, and stops', async () => {
  const result = await transcribeEpisode('ep', {}, deps)
  assert.equal(result.status, 'needs-speakers')
  assert.equal(calls.download, 1)
  assert.equal(calls.mw.length, 1)
  assert.deepEqual(calls.mw[0].slice(0, 6), [
    'transcribe',
    work('audio.mp3'),
    '--speakers',
    '--format',
    'json',
    '-o',
  ])
  assert.ok(fs.existsSync(work('speakers.json')))
  assert.equal(transcript(), STUB)
})

test('passes --model through to mw', async () => {
  await transcribeEpisode(
    'ep',
    { model: 'parakeet-pro:nvidia_parakeet-v3_494MB' },
    deps,
  )
  assert.deepEqual(calls.mw[0].slice(-2), [
    '--model',
    'parakeet-pro:nvidia_parakeet-v3_494MB',
  ])
})

test('a second run without names stops and names the empty labels', async () => {
  await transcribeEpisode('ep', {}, deps)
  await assert.rejects(
    () => transcribeEpisode('ep', {}, deps),
    /Speaker 1, Speaker 2, Speaker 3/,
  )
})

test('a run with names writes transcript.mdx and skips finished steps', async () => {
  await transcribeEpisode('ep', {}, deps)
  fillSpeakers(
    {
      'Speaker 1': 'Jim Ray',
      'Speaker 2': 'Alex Garnett',
      'Speaker 3': 'Juliet Shen',
    },
    [['Skilla', 'Scylla']],
  )
  const result = await transcribeEpisode('ep', {}, deps)
  assert.equal(result.status, 'written')
  assert.equal(calls.download, 1)
  assert.equal(calls.mw.length, 1)
  const out = transcript()
  assert.match(out, /\*\*Alex Garnett:\*\* Congratulations on 1\.0\./)
  assert.match(out, /Scylla is optional\./)
})

test('refuses to overwrite a transcript that has content', async () => {
  await transcribeEpisode('ep', {}, deps)
  fillSpeakers({
    'Speaker 1': 'Jim Ray',
    'Speaker 2': 'Alex Garnett',
    'Speaker 3': 'Juliet Shen',
  })
  await transcribeEpisode('ep', {}, deps)
  fs.writeFileSync(
    path.join(root, 'podcast', 'ep', 'transcript.mdx'),
    'hand edits',
  )
  await assert.rejects(() => transcribeEpisode('ep', {}, deps), /--force/)
  assert.equal(transcript(), 'hand edits')
})

test('--force overwrites a transcript that has content', async () => {
  await transcribeEpisode('ep', {}, deps)
  fillSpeakers({
    'Speaker 1': 'Jim Ray',
    'Speaker 2': 'Alex Garnett',
    'Speaker 3': 'Juliet Shen',
  })
  fs.writeFileSync(
    path.join(root, 'podcast', 'ep', 'transcript.mdx'),
    'hand edits',
  )
  await transcribeEpisode('ep', { force: true }, deps)
  assert.match(transcript(), /Juliet Shen/)
})

test('never changes hasTranscript in en.mdx', async () => {
  await transcribeEpisode('ep', {}, deps)
  fillSpeakers({
    'Speaker 1': 'Jim Ray',
    'Speaker 2': 'Alex Garnett',
    'Speaker 3': 'Juliet Shen',
  })
  await transcribeEpisode('ep', {}, deps)
  assert.equal(
    fs.readFileSync(path.join(root, 'podcast', 'ep', 'en.mdx'), 'utf-8'),
    EN_MDX,
  )
})

test('fails clearly for an unknown slug', async () => {
  await assert.rejects(
    () => transcribeEpisode('nope', {}, deps),
    /No episode "nope"/,
  )
})

test('does not keep a partial raw.json when mw fails', async () => {
  deps.runMw = (args) => {
    fs.writeFileSync(args[args.indexOf('-o') + 1], '{"segm')
    throw new Error('mw exited 1')
  }
  await assert.rejects(() => transcribeEpisode('ep', {}, deps), /mw exited 1/)
  assert.equal(fs.existsSync(work('raw.json')), false)
  assert.equal(fs.existsSync(work('raw.json.partial')), false)
})

// mw won't replace an existing output file without --overwrite, so a partial
// file left by a killed run would otherwise block every later run.
test('asks mw to overwrite a leftover partial file', async () => {
  await transcribeEpisode('ep', {}, deps)
  assert.ok(calls.mw[0].includes('--overwrite'))
})

// MacWhisper runs on the Mac, but node_modules is installed from the Linux
// VM, so tsx/esbuild can't run there. The script must load with plain node.
test('runs with plain node, without tsx', () => {
  const script = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    'transcribe-episode.mjs',
  )
  const { NODE_OPTIONS, ...env } = process.env
  const r = spawnSync(process.execPath, [script], { encoding: 'utf-8', env })
  assert.equal(r.status, 1)
  assert.match(r.stderr, /Usage: npm run transcribe <slug>/)
})
