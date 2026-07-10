import * as path from 'node:path'
import type { StudioPaths } from './service'

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
