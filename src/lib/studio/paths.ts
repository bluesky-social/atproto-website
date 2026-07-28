import * as path from 'node:path'
import type { StudioPaths } from './service'
import { isoToDateStamp } from './episodeDates'

export function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function studioPaths(): StudioPaths {
  const cwd = process.cwd()
  return {
    blogDir: path.join(cwd, 'src', 'app', '[locale]', 'blog'),
    postsFile: path.join(cwd, 'src', 'lib', 'posts.ts'),
    authorsFile: path.join(cwd, 'src', 'lib', 'authors.json'),
  }
}

export type EpisodePaths = { podcastDir: string; episodesFile: string }

export function episodePaths(): EpisodePaths {
  const cwd = process.cwd()
  return {
    podcastDir: path.join(cwd, 'src', 'app', '[locale]', 'off-protocol'),
    episodesFile: path.join(cwd, 'src', 'lib', 'episodes.ts'),
  }
}

/**
 * The R2 object key for an episode's MP3, matching the layout the show already
 * uses: a date-stamped directory per episode (`off-protocol/2026-06-16-<slug>/`).
 * Derived from the episode's publish date; an episode with no usable pubDate
 * gets an undated directory rather than a bogus one. The key is fixed at upload
 * time — changing the publish date later doesn't move the object, and the URL
 * stored in the episode header stays authoritative.
 */
export function audioObjectKey(slug: string, pubDate: string): string {
  const stamp = isoToDateStamp(pubDate)
  const dir = stamp ? `${stamp}-${slug}` : slug
  return `off-protocol/${dir}/${slug}.mp3`
}

/**
 * Recover an object key from an episode's stored `audioUrl`.
 *
 * The stored URL is authoritative — the key is fixed when the object is
 * uploaded, so recomputing it from slug and pubDate would miss a publish date
 * edited afterwards. Returns null when the audio isn't in our bucket (empty, or
 * hosted elsewhere), so a delete is never issued for an object we don't own.
 */
export function objectKeyFromUrl(audioUrl: string, publicBase: string): string | null {
  if (!audioUrl) return null
  const base = publicBase.replace(/\/$/, '')
  const prefix = `${base}/`
  if (!audioUrl.startsWith(prefix)) return null
  const key = audioUrl.slice(prefix.length)
  return key || null
}

export type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBase: string
  /** S3-compatible endpoint for the account, derived from accountId. */
  endpoint: string
}

// `<bucket name>` and friends are non-empty, so an emptiness check passes them
// through to Cloudflare, which answers with an opaque 403. Catch them here
// instead: no legitimate credential or bucket name contains these.
function looksLikePlaceholder(value: string): boolean {
  return /[<>\s]/.test(value)
}

export function r2Config(): R2Config {
  const required = {
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_BASE: process.env.R2_PUBLIC_BASE,
  }

  const missing = Object.entries(required)
    .filter(([, v]) => !v || !v.trim())
    .map(([k]) => k)
  if (missing.length) {
    throw new Error(`R2 not configured — set ${missing.join(', ')} in .env`)
  }

  const placeholders = Object.entries(required)
    .filter(([, v]) => looksLikePlaceholder(v!.trim()))
    .map(([k]) => k)
  if (placeholders.length) {
    throw new Error(
      `R2 misconfigured — ${placeholders.join(', ')} still looks like a placeholder, not a real value`,
    )
  }

  const accountId = required.CLOUDFLARE_ACCOUNT_ID!.trim()
  return {
    accountId,
    accessKeyId: required.R2_ACCESS_KEY_ID!.trim(),
    secretAccessKey: required.R2_SECRET_ACCESS_KEY!.trim(),
    bucket: required.R2_BUCKET!.trim(),
    publicBase: required.R2_PUBLIC_BASE!.trim().replace(/\/$/, ''),
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  }
}
