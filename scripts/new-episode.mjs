#!/usr/bin/env node
// scripts/new-episode.mjs

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { smartText } from '../src/mdx/smartText.mjs'
import { gitState, createBranch, branchNameFor } from '../src/lib/git.mjs'
import { episodeSlug } from '../src/lib/slugs.mjs'
import {
  EPISODE_FORMATS,
  FORMAT_LABELS,
  DEFAULT_EPISODE_FORMAT,
  toEpisodeFormat,
} from '../src/lib/episodeFormat.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PODCAST_DIR = path.join(__dirname, '../src/app/[locale]/off-protocol')
const EPISODES_FILE = path.join(__dirname, '../src/lib/episodes.ts')

// Anchor used to insert new episode entries at the top of the array.
// If this regex stops matching (e.g., someone drops the explicit type
// annotation), the prepend would no-op silently — so we validate up front
// AND re-check after the replace.
const EPISODES_ANCHOR = /export const episodes: Episode\[\] = \[/

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatHHMMSS(totalSeconds) {
  const s = Math.round(totalSeconds)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

async function headAudio(url) {
  // Returns { sizeBytes, contentType } or throws.
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
  if (!res.ok) {
    throw new Error(`HEAD ${url} returned ${res.status}`)
  }
  const len = res.headers.get('content-length')
  const type = res.headers.get('content-type') ?? 'audio/mpeg'
  if (!len) {
    throw new Error(`HEAD ${url} did not return Content-Length`)
  }
  return { sizeBytes: parseInt(len, 10), contentType: type }
}

function probeDuration(url) {
  // Prefer ffprobe if installed. Returns seconds, or null if unavailable.
  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${url}"`,
      // Ignore stderr so a missing/failing ffprobe falls through silently to
      // the manual-entry prompt instead of leaking "ffprobe: not found".
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim()
    const seconds = parseFloat(out)
    // ffprobe reports fractional seconds (e.g. 2794.500625); round to a whole
    // second so durationSeconds stays an integer and the listing page renders
    // cleanly.
    if (Number.isFinite(seconds) && seconds > 0) return Math.round(seconds)
  } catch {
    // ffprobe not installed or failed — fall through
  }
  return null
}

async function checkGitStatus() {
  let state
  try {
    state = await gitState()
  } catch {
    console.error('Error: Failed to check git status. Are you in a git repository?')
    process.exit(1)
  }
  if (state.dirty) {
    console.error(
      `⚠️ You have uncommitted changes on ${state.branch}. Please commit or stash before continuing.`,
    )
    process.exit(1)
  }
  const answer = await question('Create a new branch from origin/main? (Y/n): ')
  return answer.trim().toLowerCase() !== 'n'
}

// Prompts for the branch name, defaulting to the same off-protocol-<date> the
// studio suggests, then creates it from origin/main. Shares one implementation
// with the studio so the two tools can't drift.
async function makeBranch(pubDate, slug) {
  const suggested = branchNameFor('podcast', { pubDate, slug })
  const answer = (await question(`Branch name (${suggested}): `)).trim()
  const name = answer || suggested
  console.log(`\nFetching origin/main and creating ${name}...`)
  try {
    await createBranch(name)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
  return name
}

function nextEpisodeNumber() {
  const content = fs.readFileSync(EPISODES_FILE, 'utf-8')
  const matches = [...content.matchAll(/episodeNumber:\s*(\d+)/g)]
  const max = matches.reduce((m, x) => Math.max(m, parseInt(x[1], 10)), 0)
  return max + 1
}

export async function main() {
  console.log('\n🎙️  Create a new Off Protocol episode\n')

  const shouldCreateBranch = await checkGitStatus()

  // Fail fast if the anchor we insert against isn't where we expect it,
  // rather than running the user through every prompt and then writing
  // the episode dir without ever appearing in the listing or feed.
  if (!EPISODES_ANCHOR.test(fs.readFileSync(EPISODES_FILE, 'utf-8'))) {
    console.error(
      `Error: could not find 'export const episodes: Episode[] = [' in ${EPISODES_FILE}.`,
    )
    console.error(
      "The scaffolder uses that line as the anchor for new entries. If the",
    )
    console.error(
      "file has been reformatted, update EPISODES_ANCHOR in this script first.",
    )
    process.exit(1)
  }

  // Stamped up front: the slug suggestion and the branch name both need it.
  const now = new Date()
  const date = formatDate(now)
  const pubDate = now.toISOString()

  const title = smartText((await question('Title: ')).trim())
  if (!title) {
    console.error('Error: Title is required')
    process.exit(1)
  }

  const guestsInput = (await question('Guests (comma-separated, optional): ')).trim()
  const guests = guestsInput
    ? guestsInput.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  // Formats offered as a numbered list: typing 'ama' works too, but the numbers
  // make the vocabulary discoverable without reading the source.
  console.log('\nFormat:')
  EPISODE_FORMATS.forEach((f, i) => {
    const marker = f === DEFAULT_EPISODE_FORMAT ? ' (default)' : ''
    console.log(`  ${i + 1}) ${FORMAT_LABELS[f]}${marker}`)
  })
  const formatInput = (await question('Format (1-3 or name): ')).trim()
  const byNumber = EPISODE_FORMATS[Number(formatInput) - 1]
  // An empty or unrecognized answer falls back to the default; echoing the
  // result means a typo is visible before anything is written.
  const format = byNumber ?? toEpisodeFormat(formatInput)
  console.log(`  Using: ${FORMAT_LABELS[format]}`)

  // YYYY-MM-DD-title[-first-guest], the same default the studio offers.
  const suggestedSlug = episodeSlug({ pubDate, title, guests })
  const slugInput = (await question(`Slug (${suggestedSlug}): `)).trim()
  const slug = slugInput || suggestedSlug

  const suggestedNumber = nextEpisodeNumber()
  const numberInput = (
    await question(`Episode number (${suggestedNumber}): `)
  ).trim()
  const episodeNumber = numberInput ? parseInt(numberInput, 10) : suggestedNumber
  if (!Number.isInteger(episodeNumber) || episodeNumber < 1) {
    console.error('Error: Episode number must be a positive integer')
    process.exit(1)
  }

  const description = smartText((await question('Description: ')).trim())
  if (!description) {
    console.error('Error: Description is required')
    process.exit(1)
  }

  const audioUrl = (await question('Audio URL (CDN MP3): ')).trim()
  if (!audioUrl) {
    console.error('Error: Audio URL is required')
    process.exit(1)
  }

  console.log('\nProbing audio…')
  let audioInfo
  try {
    audioInfo = await headAudio(audioUrl)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    console.error('Refusing to scaffold an episode with an unreachable audio URL.')
    process.exit(1)
  }
  console.log(
    `  ${audioInfo.sizeBytes.toLocaleString()} bytes, ${audioInfo.contentType}`,
  )

  let durationSeconds = probeDuration(audioUrl)
  if (durationSeconds === null) {
    const manual = (
      await question(
        'Duration (HH:MM:SS) — ffprobe not available, please enter manually: ',
      )
    ).trim()
    const parts = manual.split(':').map((n) => parseInt(n, 10))
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      console.error('Error: Duration must be HH:MM:SS')
      process.exit(1)
    }
    durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  const duration = formatHHMMSS(durationSeconds)
  console.log(`  Duration: ${duration} (${durationSeconds}s)`)

  const blueskyPostUrl = (
    await question('Bluesky discussion post URL (optional): ')
  ).trim()

  let branchName
  if (shouldCreateBranch) {
    branchName = await makeBranch(pubDate, slug)
  }

  rl.close()

  // Create directory
  const episodeDir = path.join(PODCAST_DIR, slug)
  if (fs.existsSync(episodeDir)) {
    console.error(`Error: Directory already exists: ${episodeDir}`)
    process.exit(1)
  }
  fs.mkdirSync(episodeDir, { recursive: true })

  // Write page.tsx
  // No title/description here: the route reads them from the MDX header, so
  // page.tsx can't drift from the content. en.mdx and transcript.mdx are static
  // imports because episodes aren't translated, and the module edge is what makes
  // show-notes edits hot-reload.
  const pageTsx = `import { EpisodePage } from '@/components/EpisodePage'
import { mdxRouteMetadata } from '@/lib/localizedMdx'
import * as notes from './en.mdx'
import * as transcript from './transcript.mdx'

// Metadata comes from the MDX header (see mdx.d.ts). Episodes aren't
// translated, so en.mdx and transcript.mdx are static imports — which is also
// what makes show-notes edits hot-reload.

export function generateMetadata() {
  return mdxRouteMetadata(notes)
}

export default function EpisodeRoute() {
  return (
    <EpisodePage
      default={notes.default}
      header={notes.header}
      Transcript={transcript.default}
    />
  )
}
`
  fs.writeFileSync(path.join(episodeDir, 'page.tsx'), pageTsx)

  // Write en.mdx
  const guestsField = guests.length
    ? `  guests: [${guests.map((g) => `'${g.replace(/'/g, "\\'")}'`).join(', ')}],\n`
    : ''
  const blueskyField = blueskyPostUrl
    ? `  blueskyPostUrl: '${blueskyPostUrl.replace(/'/g, "\\'")}',\n`
    : ''

  const enMdx = `export const header = {
  episodeNumber: ${episodeNumber},
  title: '${title.replace(/'/g, "\\'")}',
  description: '${description.replace(/'/g, "\\'")}',
  date: '${date}',
  pubDate: '${pubDate}',
  hosts: ['Jim Ray'],
  duration: '${duration}',
  durationSeconds: ${durationSeconds},
${guestsField}  format: '${format}',
  audioUrl: '${audioUrl.replace(/'/g, "\\'")}',
  audioSizeBytes: ${audioInfo.sizeBytes},
  audioMimeType: '${audioInfo.contentType.replace(/'/g, "\\'")}',
  // Flip to true once you've written the show notes / transcript below.
  hasShowNotes: false,
  hasTranscript: false,
${blueskyField}}

{/* Write show notes below, then flip hasShowNotes: true above. Avoid a top-level # heading — the page renders the episode title for you. */}
`
  fs.writeFileSync(path.join(episodeDir, 'en.mdx'), enMdx)

  // Transcript stub renders nothing until the author replaces the comment.
  fs.writeFileSync(
    path.join(episodeDir, 'transcript.mdx'),
    '{/* Paste the episode transcript here, then flip hasTranscript: true in en.mdx. */}\n',
  )

  // Prepend new entry to episodes.ts
  let episodesFile = fs.readFileSync(EPISODES_FILE, 'utf-8')
  const newEntry = `  {
    slug: '${slug}',
    episodeNumber: ${episodeNumber},
    title: '${title.replace(/'/g, "\\'")}',
    description: '${description.replace(/'/g, "\\'")}',
    date: '${date}',
    pubDate: '${pubDate}',
    duration: '${duration}',
    durationSeconds: ${durationSeconds},
${guests.length ? `    guests: [${guests.map((g) => `'${g.replace(/'/g, "\\'")}'`).join(', ')}],\n` : ''}    format: '${format}',
    audioUrl: '${audioUrl.replace(/'/g, "\\'")}',
    audioSizeBytes: ${audioInfo.sizeBytes},
    audioMimeType: '${audioInfo.contentType.replace(/'/g, "\\'")}',
${blueskyPostUrl ? `    blueskyPostUrl: '${blueskyPostUrl.replace(/'/g, "\\'")}',\n` : ''}  },`

  const updated = episodesFile.replace(
    EPISODES_ANCHOR,
    `export const episodes: Episode[] = [\n${newEntry}`,
  )
  if (updated === episodesFile) {
    // Pre-flight already validated the anchor, so reaching here means
    // something raced or the regex regressed. Bail loudly so the new
    // episode doesn't ship as an orphan dir.
    console.error(
      `Error: failed to insert the new entry into ${EPISODES_FILE}.`,
    )
    console.error(
      'The anchor regex matched at pre-flight but the replace was a no-op.',
    )
    process.exit(1)
  }
  fs.writeFileSync(EPISODES_FILE, updated)

  console.log(`
✅ Episode created!${branchName ? `\n\nBranch: ${branchName} (from origin/main)` : ''}

Files:
  - src/app/[locale]/off-protocol/${slug}/page.tsx
  - src/app/[locale]/off-protocol/${slug}/en.mdx
  - src/app/[locale]/off-protocol/${slug}/transcript.mdx

Next:
  1. Edit en.mdx with your show notes, then flip hasShowNotes: true
     in the MDX header (the single source of truth — the RSS feed reads it)
  2. Edit transcript.mdx, then flip hasTranscript: true in the MDX header
  3. npm run dev — preview at http://localhost:3000/off-protocol/${slug}
`)
}
