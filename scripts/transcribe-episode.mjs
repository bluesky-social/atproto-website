#!/usr/bin/env node
// scripts/transcribe-episode.mjs
//
// npm run transcribe <slug> [--model <id>] [--force]
// npm run transcribe --all [--model <id>]
//
// Runs on the Mac: `mw` is MacWhisper's CLI and talks to the running app.
// Plain node only — no tsx — because node_modules comes from the Linux VM
// and esbuild's native binary won't run on macOS.
// Each run resumes where the last one stopped, keeping its work in
// tmp-transcripts/<slug>/ (gitignored):
//
//   1. audio.mp3      downloaded from the episode's audioUrl
//   2. raw.json       `mw transcribe --speakers --format json`
//   3. speakers.json  template — fill in a name for each speaker label
//   4. transcript.mdx written next to en.mdx
//
// It never sets hasTranscript: a person reads the draft first.

import * as fs from 'node:fs'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { groupTurns, toMdx } from './lib/transcript.mjs'
import { readEpisodeHeader } from './lib/readEpisodeHeader.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DEFAULT_DEPS = {
  podcastDir: path.join(__dirname, '../src/app/[locale]/off-protocol'),
  workDir: path.join(__dirname, '../tmp-transcripts'),
  log: (msg) => console.log(msg),
  download: async (url, dest) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET ${url} returned ${res.status}`)
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  },
  runMw: (args) => {
    try {
      execFileSync('mw', args, { stdio: 'inherit' })
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(
          '`mw` not found. Install it from MacWhisper → Settings → Advanced → Command-Line Tool.',
        )
      }
      throw err
    }
  },
}

/** True for the placeholder that new-episode writes, or an empty file. */
export function isStubTranscript(content) {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').trim() === ''
}

const SAMPLE_WORDS = 25

export function speakerTemplate(segments, { hosts, guests }) {
  const speakers = {}
  const words = {}
  for (const { speaker, text } of segments) {
    speakers[speaker] = ''
    words[speaker] ??= []
    if (words[speaker].length <= SAMPLE_WORDS)
      words[speaker].push(...text.trim().split(/\s+/))
  }
  const samples = Object.fromEntries(
    Object.entries(words).map(([speaker, w]) => [
      speaker,
      w.length > SAMPLE_WORDS
        ? `${w.slice(0, SAMPLE_WORDS).join(' ')} …`
        : w.join(' '),
    ]),
  )
  return { speakers, names: [...hosts, ...guests], samples, glossary: [] }
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function parseSpeakerConfig(config) {
  const speakers = config.speakers ?? {}
  const empty = Object.keys(speakers).filter((k) => !String(speakers[k]).trim())
  if (empty.length)
    throw new Error(`speakers.json has no name for: ${empty.join(', ')}`)
  const glossary = (config.glossary ?? []).map(([from, to]) => [
    new RegExp(`(?<!\\w)${escapeRegExp(from)}(?!\\w)`, 'g'),
    to,
  ])
  return { speakers, glossary }
}

export async function transcribeEpisode(
  slug,
  { model, force = false } = {},
  deps = DEFAULT_DEPS,
) {
  const { podcastDir, workDir, log, download, runMw } = deps
  const episodeDir = path.join(podcastDir, slug)
  const enPath = path.join(episodeDir, 'en.mdx')
  if (!fs.existsSync(enPath))
    throw new Error(`No episode "${slug}" in ${podcastDir}`)
  const fields = readEpisodeHeader(fs.readFileSync(enPath, 'utf-8'))

  const dir = path.join(workDir, slug)
  fs.mkdirSync(dir, { recursive: true })
  const audio = path.join(dir, 'audio.mp3')
  const raw = path.join(dir, 'raw.json')
  const speakersPath = path.join(dir, 'speakers.json')

  if (!fs.existsSync(audio)) {
    log(`Downloading ${fields.audioUrl}`)
    await download(fields.audioUrl, audio)
  }

  if (!fs.existsSync(raw)) {
    log(`Transcribing ${slug} with MacWhisper…`)
    // Write to a temporary name so a failed run doesn't leave a raw.json
    // that later runs would trust.
    const partial = `${raw}.partial`
    try {
      runMw([
        'transcribe',
        audio,
        '--speakers',
        '--format',
        'json',
        '-o',
        partial,
        '--overwrite',
        ...(model ? ['--model', model] : []),
      ])
      fs.renameSync(partial, raw)
    } finally {
      fs.rmSync(partial, { force: true })
    }
  }
  const { segments } = JSON.parse(fs.readFileSync(raw, 'utf-8'))

  if (!fs.existsSync(speakersPath)) {
    fs.writeFileSync(
      speakersPath,
      `${JSON.stringify(speakerTemplate(segments, fields), null, 2)}\n`,
    )
    log(
      `Fill in a name for each speaker in ${speakersPath}, then run this again.`,
    )
    return { status: 'needs-speakers', speakersPath }
  }
  const { speakers, glossary } = parseSpeakerConfig(
    JSON.parse(fs.readFileSync(speakersPath, 'utf-8')),
  )

  const transcriptPath = path.join(episodeDir, 'transcript.mdx')
  if (
    !force &&
    fs.existsSync(transcriptPath) &&
    !isStubTranscript(fs.readFileSync(transcriptPath, 'utf-8'))
  ) {
    throw new Error(
      `${transcriptPath} already has content. Use --force to overwrite it.`,
    )
  }
  fs.writeFileSync(
    transcriptPath,
    toMdx(groupTurns(segments), speakers, { glossary }),
  )
  log(
    `Wrote ${transcriptPath}. Read it, then set hasTranscript: true in en.mdx.`,
  )
  return { status: 'written', transcriptPath }
}

function parseArgs(argv) {
  const opts = { force: false, all: false, model: undefined, slug: undefined }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force') opts.force = true
    else if (a === '--all') opts.all = true
    else if (a === '--model') opts.model = argv[++i]
    else if (!a.startsWith('--')) opts.slug = a
    else throw new Error(`Unknown option ${a}`)
  }
  return opts
}

export async function main(argv = process.argv.slice(2)) {
  const { slug, all, ...opts } = parseArgs(argv)
  if (!slug && !all) {
    throw new Error(
      'Usage: npm run transcribe <slug> [--model <id>] [--force]\n       npm run transcribe --all [--model <id>]',
    )
  }
  if (!all) return transcribeEpisode(slug, opts)

  // --all: every episode still without a published transcript. Failures are
  // reported per episode so one bad file doesn't stop the batch.
  const { podcastDir } = DEFAULT_DEPS
  const slugs = fs.readdirSync(podcastDir).filter((s) => {
    const en = path.join(podcastDir, s, 'en.mdx')
    return (
      fs.existsSync(en) &&
      !readEpisodeHeader(fs.readFileSync(en, 'utf-8')).hasTranscript
    )
  })
  for (const s of slugs) {
    try {
      const { status } = await transcribeEpisode(s, opts)
      console.log(`${s}: ${status}`)
    } catch (err) {
      console.error(`${s}: ${err.message}`)
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
