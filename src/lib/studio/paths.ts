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
