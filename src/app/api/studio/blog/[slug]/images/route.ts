import { isProd, studioPaths } from '@/lib/studio/paths'
import { listPostImages, savePostImage } from '@/lib/studio/service'
import { imageExtFor, POST_IMAGE_EXTS } from '@/lib/studio/postImages'

export const runtime = 'nodejs'

// Same ceiling as the OG image. These are inline illustrations, not downloads —
// anything larger is a file that should have been resized before it got here.
const MAX_BYTES = 8 * 1024 * 1024

type Ctx = { params: Promise<{ slug: string }> }

// The post's inline images, each with the identifier its preamble binds.
export async function GET(_request: Request, { params }: Ctx) {
  if (isProd()) return new Response('Not found', { status: 404 })
  const { slug } = await params
  try {
    return Response.json({ slug, images: await listPostImages(studioPaths(), slug) })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 404 })
  }
}

// Accept a dropped image, store it beside en.mdx, and add its import.
export async function POST(request: Request, { params }: Ctx) {
  if (isProd()) return new Response('Not found', { status: 404 })
  const { slug } = await params
  try {
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
    const ext = imageExtFor(file.name, file.type)
    if (!ext) {
      return Response.json(
        { error: `Unsupported type — use ${POST_IMAGE_EXTS.join(', ').toUpperCase()}` },
        { status: 400 },
      )
    }
    const bytes = Buffer.from(await file.arrayBuffer())
    // The revision comes back too: adding the import changed en.mdx, so the
    // open editor needs it or its next save is refused as a conflict.
    const saved = await savePostImage(studioPaths(), slug, bytes, file.name, ext)
    return Response.json({ slug, ...saved })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
