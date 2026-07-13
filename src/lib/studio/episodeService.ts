import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { randomBytes } from 'node:crypto'
import { parseMdxFile, serializeMdxFile, normalizeBodySeparation } from './mdxHeader'
import {
  newEpisodeMdx,
  applyEpisodeFields,
  getEpisodeFields,
  type EpisodeFields,
} from './episodeHeader'
import {
  prependEntry,
  updateEntryBySlug,
  removeEntryBySlug,
  type EpisodeEntry,
} from './episodesFile'
import { findOgImage } from './service'
import { r2Config, type EpisodePaths } from './paths'

const execFileAsync = promisify(execFile)

export type CreateEpisodeInput = {
  slug: string
  episodeNumber?: number
  title: string
  description: string
  date: string
  hosts: string[]
  guests: string[]
  duration: string
  durationSeconds: number
  audioUrl: string
  audioSizeBytes: number
  audioMimeType?: string
  explicit: boolean
  blueskyPostUrl: string
  body?: string
}

const TRANSCRIPT_STUB =
  '{/* Paste the episode transcript here, then flip hasTranscript: true in en.mdx. */}\n'

function pageTsx(title: string, description: string): string {
  const q = (v: string) => v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return `import { EpisodePage } from '@/components/EpisodePage'

export const metadata = {
  title: '${q(title)}',
  description: '${q(description)}',
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
}

function entryFrom(slug: string, f: EpisodeFields): EpisodeEntry {
  return {
    slug,
    episodeNumber: f.episodeNumber,
    title: f.title,
    description: f.description,
    date: f.date,
    pubDate: f.pubDate,
    duration: f.duration,
    durationSeconds: f.durationSeconds,
    guests: f.guests,
    audioUrl: f.audioUrl,
    audioSizeBytes: f.audioSizeBytes,
    audioMimeType: f.audioMimeType,
    explicit: f.explicit,
    blueskyPostUrl: f.blueskyPostUrl,
  }
}

export async function nextEpisodeNumber(paths: EpisodePaths): Promise<number> {
  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  const nums = [...src.matchAll(/episodeNumber:\s*(\d+)/g)].map((m) => Number(m[1]))
  return (nums.length ? Math.max(...nums) : 0) + 1
}

export async function listEpisodes(
  paths: EpisodePaths,
): Promise<{ slug: string; title: string; episodeNumber: number }[]> {
  const dirents = await fs.readdir(paths.podcastDir, { withFileTypes: true })
  const out: { slug: string; title: string; episodeNumber: number }[] = []
  for (const d of dirents) {
    if (!d.isDirectory()) continue
    const mdxPath = path.join(paths.podcastDir, d.name, 'en.mdx')
    if (!existsSync(mdxPath)) continue
    try {
      const f = getEpisodeFields(parseMdxFile(await fs.readFile(mdxPath, 'utf-8')))
      out.push({ slug: d.name, title: f.title || d.name, episodeNumber: f.episodeNumber })
    } catch {
      out.push({ slug: d.name, title: d.name, episodeNumber: 0 })
    }
  }
  return out.sort((a, b) => b.episodeNumber - a.episodeNumber || a.slug.localeCompare(b.slug))
}

export async function readEpisode(
  paths: EpisodePaths,
  slug: string,
): Promise<{ slug: string; fields: EpisodeFields; body: string; ogImage: string | null }> {
  const mdxPath = path.join(paths.podcastDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) throw new Error(`Episode not found: ${slug}`)
  const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
  return {
    slug,
    fields: getEpisodeFields(parsed),
    body: parsed.body.replace(/^\n+/, ''),
    ogImage: findOgImage(paths.podcastDir, slug),
  }
}

export async function createEpisode(
  paths: EpisodePaths,
  input: CreateEpisodeInput,
): Promise<{ slug: string }> {
  for (const f of ['slug', 'title', 'description', 'date'] as const) {
    if (!input[f] || !String(input[f]).trim()) throw new Error(`Field "${f}" is required`)
  }
  const dir = path.join(paths.podcastDir, input.slug)
  if (existsSync(dir)) throw new Error(`An episode with slug "${input.slug}" already exists`)

  const fields: EpisodeFields = {
    episodeNumber: input.episodeNumber ?? (await nextEpisodeNumber(paths)),
    title: input.title,
    description: input.description,
    date: input.date,
    pubDate: new Date().toISOString(),
    hosts: input.hosts,
    duration: input.duration,
    durationSeconds: input.durationSeconds,
    guests: input.guests,
    audioUrl: input.audioUrl,
    audioSizeBytes: input.audioSizeBytes,
    audioMimeType: input.audioMimeType ?? 'audio/mpeg',
    hasShowNotes: Boolean(input.body && input.body.trim()),
    hasTranscript: false,
    explicit: input.explicit,
    blueskyPostUrl: input.blueskyPostUrl,
  }
  const body = input.body && input.body.trim() ? input.body : 'Show notes go here.\n'

  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  const nextSrc = prependEntry(src, entryFrom(input.slug, fields))

  await fs.mkdir(dir, { recursive: true })
  try {
    await fs.writeFile(path.join(dir, 'page.tsx'), pageTsx(input.title, input.description))
    await fs.writeFile(path.join(dir, 'en.mdx'), newEpisodeMdx(fields, body))
    await fs.writeFile(path.join(dir, 'transcript.mdx'), TRANSCRIPT_STUB)
    await fs.writeFile(paths.episodesFile, nextSrc)
  } catch (err) {
    // Roll back the partially-created directory so a retry isn't blocked.
    await fs.rm(dir, { recursive: true, force: true })
    throw err
  }
  return { slug: input.slug }
}

export async function updateEpisode(
  paths: EpisodePaths,
  slug: string,
  input: { fields: EpisodeFields; body: string },
): Promise<{ slug: string }> {
  const mdxPath = path.join(paths.podcastDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) throw new Error(`Episode not found: ${slug}`)
  const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
  const next = applyEpisodeFields(parsed, input.fields)
  next.body = normalizeBodySeparation(input.body)
  await fs.writeFile(mdxPath, serializeMdxFile(next))

  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  await fs.writeFile(
    paths.episodesFile,
    updateEntryBySlug(src, slug, entryFrom(slug, input.fields)),
  )
  return { slug }
}

export async function deleteEpisode(
  paths: EpisodePaths,
  slug: string,
): Promise<{ slug: string; dirRemoved: boolean; entryRemoved: boolean }> {
  const dir = path.join(paths.podcastDir, slug)
  const dirRemoved = existsSync(dir)
  if (dirRemoved) await fs.rm(dir, { recursive: true, force: true })
  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  const nextSrc = removeEntryBySlug(src, slug)
  const entryRemoved = nextSrc !== src
  if (entryRemoved) await fs.writeFile(paths.episodesFile, nextSrc)
  return { slug, dirRemoved, entryRemoved }
}

export async function uploadAudio(
  slug: string,
  bytes: Buffer,
): Promise<{ audioUrl: string; audioSizeBytes: number }> {
  const { bucket, publicBase, token, accountId } = r2Config()
  const key = `off-protocol/${slug}/${slug}.mp3`
  const tmp = path.join(os.tmpdir(), `studio-${slug}-${randomBytes(4).toString('hex')}.mp3`)
  await fs.writeFile(tmp, bytes)
  try {
    await execFileAsync(
      'npx',
      ['wrangler', 'r2', 'object', 'put', `${bucket}/${key}`, '--file', tmp, '--remote', '--content-type', 'audio/mpeg'],
      { env: { ...process.env, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: accountId }, timeout: 300_000 },
    )
  } finally {
    await fs.rm(tmp, { force: true })
  }
  return { audioUrl: `${publicBase}/${key}`, audioSizeBytes: bytes.length }
}
