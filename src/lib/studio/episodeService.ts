import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import * as path from 'node:path'
import { parseMdxFile, serializeMdxFile, normalizeBodySeparation } from './mdxHeader'
import { fileRevision, assertRevision } from './revision'
import { applyAuthorDids } from './authorsFile'
import {
  toEpisodeFormat,
  DEFAULT_EPISODE_FORMAT,
  type EpisodeFormat,
} from '@/lib/episodeFormat.mjs'
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
import { smartenTitleAndDescription } from './smartText'
import {
  r2Config,
  audioObjectKey,
  objectKeyFromUrl,
  type EpisodePaths,
} from './paths'

export type CreateEpisodeInput = {
  slug: string
  episodeNumber?: number
  title: string
  description: string
  date: string
  /** ISO 8601. Defaults to now when the caller doesn't set a publish date. */
  pubDate?: string
  hosts: string[]
  guests: string[]
  /** Defaults to 'conversation' when the caller doesn't say. */
  format?: EpisodeFormat
  /**
   * Name → DID for hosts or guests authors.json doesn't know yet, so a new
   * guest's byline links to their profile instead of rendering as plain text.
   */
  authorDids?: Record<string, string>
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

/**
 * The `page.tsx` written alongside a new episode.
 *
 * Takes no arguments: the route reads its title and description from the MDX
 * header, so nothing is interpolated and nothing can drift from the content.
 * en.mdx and transcript.mdx are static imports — episodes aren't translated, and
 * the module edge is what lets show-notes edits hot-reload.
 */
function pageTsx(): string {
  return `import { EpisodePage } from '@/components/EpisodePage'
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
}

// Exported for the one-shot format backfill, which needs the same
// EpisodeFields → EpisodeEntry mapping the service uses.
export function entryFrom(slug: string, f: EpisodeFields): EpisodeEntry {
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
    format: f.format,
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
): Promise<{
  slug: string
  fields: EpisodeFields
  body: string
  ogImage: string | null
  revision: string
}> {
  const mdxPath = path.join(paths.podcastDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) throw new Error(`Episode not found: ${slug}`)
  const raw = await fs.readFile(mdxPath, 'utf-8')
  const parsed = parseMdxFile(raw)
  return {
    slug,
    fields: getEpisodeFields(parsed),
    body: parsed.body.replace(/^\n+/, ''),
    ogImage: findOgImage(paths.podcastDir, slug),
    // Fingerprint of exactly the bytes these fields were parsed from, so a save
    // can prove it is editing the version it was shown.
    revision: fileRevision(raw),
  }
}

export async function createEpisode(
  paths: EpisodePaths,
  rawInput: CreateEpisodeInput,
): Promise<{ slug: string; warning?: string }> {
  // Smarten before anything derives from these values, so the MDX header and the
  // episodes.ts entry agree. (page.tsx used to be a third copy; it now reads the
  // header, so there's one fewer place to keep in step.)
  const input = smartenTitleAndDescription(rawInput)
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
    pubDate: input.pubDate || new Date().toISOString(),
    hosts: input.hosts,
    duration: input.duration,
    durationSeconds: input.durationSeconds,
    guests: input.guests,
    format: input.format ?? DEFAULT_EPISODE_FORMAT,
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
    await fs.writeFile(path.join(dir, 'page.tsx'), pageTsx())
    await fs.writeFile(path.join(dir, 'en.mdx'), newEpisodeMdx(fields, body))
    await fs.writeFile(path.join(dir, 'transcript.mdx'), TRANSCRIPT_STUB)
    await fs.writeFile(paths.episodesFile, nextSrc)
  } catch (err) {
    // Roll back the partially-created directory so a retry isn't blocked.
    await fs.rm(dir, { recursive: true, force: true })
    throw err
  }
  // Best-effort, past the point where content exists: a byline link that
  // couldn't be recorded must not read as "the episode wasn't created".
  const reason = await applyAuthorDids(paths.authorsFile, input.authorDids)
  return reason
    ? { slug: input.slug, warning: `Episode created, but ${reason}` }
    : { slug: input.slug }
}

export async function updateEpisode(
  paths: EpisodePaths,
  slug: string,
  input: {
    fields: EpisodeFields
    body: string
    revision?: string
    /**
     * See CreateEpisodeInput.authorDids — accepted on update too, because a
     * guest is usually added after the episode already exists.
     */
    authorDids?: Record<string, string>
  },
): Promise<{
  slug: string
  fields: EpisodeFields
  revision: string
  warning?: string
}> {
  const mdxPath = path.join(paths.podcastDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) throw new Error(`Episode not found: ${slug}`)
  const fields = {
    ...smartenTitleAndDescription(input.fields),
    hasShowNotes: Boolean(input.body && input.body.trim()),
    // Defensive: the editor's own Fields type gains `format` in a later task,
    // and a stale browser tab can PUT without it. Without this the header would
    // get `format: 'undefined'`.
    format: toEpisodeFormat(input.fields.format),
  }
  const raw = await fs.readFile(mdxPath, 'utf-8')
  // Check before the first write, so a refusal leaves both files untouched.
  assertRevision(input.revision, fileRevision(raw), 'This episode')
  const parsed = parseMdxFile(raw)
  const next = applyEpisodeFields(parsed, fields)
  next.body = normalizeBodySeparation(input.body)
  const serialized = serializeMdxFile(next)
  await fs.writeFile(mdxPath, serialized)

  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  await fs.writeFile(
    paths.episodesFile,
    updateEntryBySlug(src, slug, entryFrom(slug, fields)),
  )
  // Hand back what was actually stored — the editor echoes the smartened title
  // and description so the transform is visible rather than silent — plus the
  // revision it just created, so the still-open form can save again without
  // conflicting with itself.
  const reason = await applyAuthorDids(paths.authorsFile, input.authorDids)

  return {
    slug,
    fields,
    revision: fileRevision(serialized),
    ...(reason ? { warning: `Episode saved, but ${reason}` } : {}),
  }
}

export type AudioFields = {
  audioUrl: string
  audioSizeBytes: number
  audioMimeType?: string
  duration?: string
  durationSeconds?: number
}

/**
 * Write just the audio fields into en.mdx and the episodes.ts entry, leaving
 * the body, hasShowNotes, and unmanaged header keys untouched. The upload route
 * calls this straight after R2 accepts the file, so an uploaded MP3 is never
 * left unreferenced by a browser that navigates away before Save.
 */
export async function setEpisodeAudio(
  paths: EpisodePaths,
  slug: string,
  audio: AudioFields,
): Promise<{ slug: string; fields: EpisodeFields; revision: string }> {
  const mdxPath = path.join(paths.podcastDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) throw new Error(`Episode not found: ${slug}`)
  const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
  const fields: EpisodeFields = {
    ...getEpisodeFields(parsed),
    audioUrl: audio.audioUrl,
    audioSizeBytes: audio.audioSizeBytes,
    ...(audio.audioMimeType ? { audioMimeType: audio.audioMimeType } : {}),
    ...(audio.duration ? { duration: audio.duration } : {}),
    ...(audio.durationSeconds ? { durationSeconds: audio.durationSeconds } : {}),
  }
  const serialized = serializeMdxFile(applyEpisodeFields(parsed, fields))
  await fs.writeFile(mdxPath, serialized)

  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  await fs.writeFile(paths.episodesFile, updateEntryBySlug(src, slug, entryFrom(slug, fields)))
  // No precondition is checked here — an upload is an append-only act on fields
  // the form isn't editing. But it *does* rewrite en.mdx, so hand back the new
  // revision or the open form goes stale and its next save is refused for
  // nothing.
  return { slug, fields, revision: fileRevision(serialized) }
}

export type DeleteEpisodeOptions = {
  /** Also delete the episode's MP3 from R2. Off by default — irreversible. */
  deleteAudio?: boolean
  /** Injectable for tests; defaults to the real R2 delete. */
  deleteObject?: (key: string) => Promise<void>
}

export type DeleteEpisodeResult = {
  slug: string
  dirRemoved: boolean
  entryRemoved: boolean
  audioKey: string | null
  audioDeleted: boolean
}

export async function deleteEpisode(
  paths: EpisodePaths,
  slug: string,
  options: DeleteEpisodeOptions = {},
): Promise<DeleteEpisodeResult> {
  const dir = path.join(paths.podcastDir, slug)
  const mdxPath = path.join(dir, 'en.mdx')

  // Resolve the key while the files still exist — once the directory is gone,
  // the only record of where the object lives is the bucket itself.
  let audioKey: string | null = null
  if (options.deleteAudio && existsSync(mdxPath)) {
    const { publicBase } = r2Config()
    const fields = getEpisodeFields(parseMdxFile(await fs.readFile(mdxPath, 'utf-8')))
    audioKey = objectKeyFromUrl(fields.audioUrl, publicBase)
  }

  let audioDeleted = false
  if (audioKey) {
    try {
      await (options.deleteObject ?? deleteAudioObject)(audioKey)
      audioDeleted = true
    } catch (err) {
      // Leave everything in place: a failed object delete plus a removed
      // episode would strand the object with no record of its key.
      throw new Error(
        `Could not delete the audio object (${audioKey}): ${(err as Error).message}. The episode was left in place.`,
      )
    }
  }

  const dirRemoved = existsSync(dir)
  if (dirRemoved) await fs.rm(dir, { recursive: true, force: true })
  const src = await fs.readFile(paths.episodesFile, 'utf-8')
  const nextSrc = removeEntryBySlug(src, slug)
  const entryRemoved = nextSrc !== src
  if (entryRemoved) await fs.writeFile(paths.episodesFile, nextSrc)
  return { slug, dirRemoved, entryRemoved, audioKey, audioDeleted }
}

/** Delete one object from the media bucket over the S3-compatible API. */
export async function deleteAudioObject(key: string): Promise<void> {
  const { bucket, endpoint, accessKeyId, secretAccessKey } = r2Config()
  const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })
  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  } finally {
    client.destroy()
  }
}

/**
 * Upload an episode MP3 to R2 over the S3-compatible API.
 *
 * Uses the bucket-scoped Access Key pair rather than a Cloudflare API token:
 * R2's REST API (what `wrangler r2 object put` calls) requires an account-wide
 * `Workers R2 Storage: Edit` token, while the S3 endpoint honors credentials
 * scoped to a single bucket. Talking S3 keeps the blast radius at one bucket and
 * avoids spawning a subprocess from inside a request handler.
 *
 * The SDK is imported lazily so it stays out of the module graph — this is a
 * dev-only path and the client is several megabytes.
 */
export async function uploadAudio(
  slug: string,
  bytes: Buffer,
  // Named rather than positional: the object key is derived from three fields
  // now, and three bare strings at the call site would be easy to transpose.
  episode: { pubDate: string; guests?: readonly string[]; format: EpisodeFormat },
): Promise<{ audioUrl: string; audioSizeBytes: number }> {
  const { bucket, publicBase, endpoint, accessKeyId, secretAccessKey } = r2Config()
  const key = audioObjectKey(slug, episode.pubDate, episode)

  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
  const client = new S3Client({
    // R2 ignores the region but the SDK insists on one.
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: 'audio/mpeg',
      }),
    )
  } finally {
    client.destroy()
  }

  return { audioUrl: `${publicBase}/${key}`, audioSizeBytes: bytes.length }
}
