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

export type R2Config = {
  token: string
  accountId: string
  bucket: string
  publicBase: string
}

export function r2Config(): R2Config {
  const token = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucket = process.env.R2_BUCKET
  const publicBase = process.env.R2_PUBLIC_BASE
  if (!token || !accountId || !bucket || !publicBase) {
    throw new Error(
      'R2 not configured — set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_BASE in .env',
    )
  }
  return { token, accountId, bucket, publicBase }
}
