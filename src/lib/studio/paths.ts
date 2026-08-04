import * as path from 'node:path'
import type { StudioPaths } from './service'
import { isoToDateStamp } from './episodeDates'
import { slugify } from '@/lib/slugs.mjs'
import { FORMAT_DIR_TOKENS, type EpisodeFormat } from '@/lib/episodeFormat.mjs'

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
 * The R2 object key for an episode's MP3:
 * `off-protocol/<YYYY-MM-DD>-<who-or-what>/<slug>.mp3`.
 *
 * The directory is named after the first guest when there is one
 * (`2026-07-22-erin-kissane`), and after the episode's format when there isn't
 * (`2026-07-08-live`). Both match folders the show already made by hand. A guest
 * wins over the format even for an AMA, so there is one rule rather than a
 * special case per format.
 *
 * It deliberately does *not* interpolate the slug: slugs begin with the publish
 * date now, which produced directories like
 * `off-protocol/2026-08-03-2026-08-03-designing-for-uncertainty-…/`.
 *
 * An episode with no usable pubDate gets an undated directory rather than a
 * bogus one. The key is fixed at upload time — changing the publish date, the
 * guests, or the format later doesn't move the object, and the URL stored in the
 * episode header stays authoritative.
 */
export function audioObjectKey(
  slug: string,
  pubDate: string,
  // readonly: this only reads the guest list, so a frozen or `as const` array is
  // just as valid an argument as a mutable one.
  episode: { guests?: readonly string[]; format: EpisodeFormat },
): string {
  const stamp = isoToDateStamp(pubDate)
  const guest = episode.guests?.[0]
  const who = guest ? slugify(guest) : FORMAT_DIR_TOKENS[episode.format]
  const dir = stamp ? `${stamp}-${who}` : slug
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
