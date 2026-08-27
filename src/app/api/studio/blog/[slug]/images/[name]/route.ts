import { isProd, studioPaths } from '@/lib/studio/paths'
import { listPostImages } from '@/lib/studio/service'
import { readFile } from 'node:fs/promises'
import * as path from 'node:path'

export const runtime = 'nodejs'

const CONTENT_TYPE: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
}

type Ctx = { params: Promise<{ slug: string; name: string }> }

// Serve one inline image's bytes so the studio can show a thumbnail. The post
// directory is source, not a public URL, so there is nothing to link to.
export async function GET(_request: Request, { params }: Ctx) {
  if (isProd()) return new Response('Not found', { status: 404 })
  const { slug, name } = await params
  const paths = studioPaths()
  try {
    // Serve only what the listing itself reports. That is the traversal guard:
    // a name is a name in this one directory, never a path to follow.
    const images = await listPostImages(paths, slug)
    if (!images.some((i) => i.filename === name)) {
      return new Response('Not found', { status: 404 })
    }
    const ext = name.split('.').pop()!.toLowerCase()
    const bytes = await readFile(path.join(paths.blogDir, slug, name))
    return new Response(new Uint8Array(bytes), {
      headers: {
        'Content-Type': CONTENT_TYPE[ext] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
