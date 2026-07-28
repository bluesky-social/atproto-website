import { isProd, studioPaths } from '@/lib/studio/paths'
import {
  findOgImage,
  saveOgImage,
  OG_IMAGE_EXTS,
  type OgImageExt,
} from '@/lib/studio/service'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import * as path from 'node:path'

export const runtime = 'nodejs'

const MAX_BYTES = 8 * 1024 * 1024 // Next's opengraph-image limit

const CONTENT_TYPE: Record<OgImageExt, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
}

type Ctx = { params: Promise<{ slug: string }> }

function notFound() {
  return new Response('Not found', { status: 404 })
}

function extFor(name: string, type: string): OgImageExt | null {
  const fromName = name.split('.').pop()?.toLowerCase()
  if (fromName && (OG_IMAGE_EXTS as readonly string[]).includes(fromName)) {
    return fromName as OgImageExt
  }
  const fromType = type.split('/').pop()?.toLowerCase()
  if (fromType === 'jpeg') return 'jpeg'
  if (fromType && (OG_IMAGE_EXTS as readonly string[]).includes(fromType)) {
    return fromType as OgImageExt
  }
  return null
}

// Serve the current opengraph-image.* bytes so the studio can preview it (the
// file lives in the post dir, not at a public URL).
export async function GET(_request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  const paths = studioPaths()
  const name = findOgImage(paths.blogDir, slug)
  if (!name) return notFound()
  const ext = name.split('.').pop() as OgImageExt
  const bytes = await readFile(path.join(paths.blogDir, slug, name))
  return new Response(bytes, {
    headers: {
      'Content-Type': CONTENT_TYPE[ext] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    },
  })
}

// Accept a dropped/selected image and save it as the post's opengraph-image.
export async function POST(request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  const paths = studioPaths()
  try {
    if (!existsSync(path.join(paths.blogDir, slug))) {
      return Response.json({ error: `Post not found: ${slug}` }, { status: 404 })
    }
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: `Image is larger than 8MB (${Math.round(file.size / 1024 / 1024)}MB)` },
        { status: 400 },
      )
    }
    const ext = extFor(file.name, file.type)
    if (!ext) {
      return Response.json(
        { error: 'Unsupported type — use PNG, JPG, JPEG, or GIF' },
        { status: 400 },
      )
    }
    const bytes = Buffer.from(await file.arrayBuffer())
    const { filename } = await saveOgImage(paths.blogDir, slug, bytes, ext)
    return Response.json({ slug, filename })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
