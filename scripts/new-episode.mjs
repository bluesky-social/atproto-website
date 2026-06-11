#!/usr/bin/env node
// scripts/new-episode.mjs

import * as readline from 'readline'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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
    if (Number.isFinite(seconds) && seconds > 0) return seconds
  } catch {
    // ffprobe not installed or failed — fall through
  }
  return null
}

async function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf-8',
    }).trim()
    if (status) {
      const branch = execSync('git branch --show-current', {
        encoding: 'utf-8',
      }).trim()
      console.error(
        `⚠️ You have uncommitted changes on ${branch}. Please commit or stash before continuing.`,
      )
      process.exit(1)
    }
  } catch {
    console.error('Error: Failed to check git status. Are you in a git repository?')
    process.exit(1)
  }
}

function nextEpisodeNumber() {
  const content = fs.readFileSync(EPISODES_FILE, 'utf-8')
  const matches = [...content.matchAll(/episodeNumber:\s*(\d+)/g)]
  const max = matches.reduce((m, x) => Math.max(m, parseInt(x[1], 10)), 0)
  return max + 1
}

export async function main() {
  console.log('\n🎙️  Create a new Off Protocol episode\n')

  await checkGitStatus()

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

  const title = (await question('Title: ')).trim()
  if (!title) {
    console.error('Error: Title is required')
    process.exit(1)
  }

  const suggestedSlug = slugify(title)
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

  const description = (await question('Description: ')).trim()
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

  const guestsInput = (await question('Guests (comma-separated, optional): ')).trim()
  const guests = guestsInput
    ? guestsInput.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const blueskyPostUrl = (
    await question('Bluesky discussion post URL (optional): ')
  ).trim()

  const now = new Date()
  const date = formatDate(now)
  const pubDate = now.toISOString()

  rl.close()

  // Create directory
  const episodeDir = path.join(PODCAST_DIR, slug)
  if (fs.existsSync(episodeDir)) {
    console.error(`Error: Directory already exists: ${episodeDir}`)
    process.exit(1)
  }
  fs.mkdirSync(episodeDir, { recursive: true })

  // Write page.tsx
  const pageTsx = `import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: '${title.replace(/'/g, "\\'")}',
  description: '${description.replace(/'/g, "\\'")}',
}

export default async function EpisodeRoute({ params }: any) {
  const Notes = await import(\`./\${(await params).locale}.mdx\`).catch(
    () => import(\`./en.mdx\`),
  )
  let Transcript = null
  try {
    Transcript = await import(\`./transcript.mdx\`)
  } catch {
    // optional
  }

  return (
    <EpisodePage
      default={Notes.default}
      header={Notes.header}
      Transcript={Transcript?.default}
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
  duration: '${duration}',
  durationSeconds: ${durationSeconds},
${guestsField}  audioUrl: '${audioUrl.replace(/'/g, "\\'")}',
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
${guests.length ? `    guests: [${guests.map((g) => `'${g.replace(/'/g, "\\'")}'`).join(', ')}],\n` : ''}    audioUrl: '${audioUrl.replace(/'/g, "\\'")}',
    audioSizeBytes: ${audioInfo.sizeBytes},
    audioMimeType: '${audioInfo.contentType.replace(/'/g, "\\'")}',
    hasShowNotes: false,
    hasTranscript: false,
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
✅ Episode created!

Files:
  - src/app/[locale]/off-protocol/${slug}/page.tsx
  - src/app/[locale]/off-protocol/${slug}/en.mdx
  - src/app/[locale]/off-protocol/${slug}/transcript.mdx

Next:
  1. Edit en.mdx with your show notes, then flip hasShowNotes: true
     (in both the MDX header and src/lib/episodes.ts)
  2. Edit transcript.mdx, then flip hasTranscript: true (same two places)
  3. npm run dev — preview at http://localhost:3000/off-protocol/${slug}
`)
}
