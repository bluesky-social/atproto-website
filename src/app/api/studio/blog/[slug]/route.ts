import { isProd, studioPaths } from '@/lib/studio/paths'
import { readPost, updatePost, deletePost, publishPost } from '@/lib/studio/service'

export const runtime = 'nodejs'

function notFound() {
  return new Response('Not found', { status: 404 })
}

type Ctx = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  try {
    return Response.json(await readPost(studioPaths(), slug))
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  try {
    const paths = studioPaths()
    const input = await request.json()
    const result = await updatePost(paths, slug, input)
    // Update the standard.site record on every save (non-blocking).
    const publish = await publishPost(paths, slug)
    return Response.json({ ...result, publish })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  try {
    return Response.json(await deletePost(studioPaths(), slug))
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
