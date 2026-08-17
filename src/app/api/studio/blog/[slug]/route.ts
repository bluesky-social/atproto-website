import { isProd, studioPaths } from '@/lib/studio/paths'
import { readPost, updatePost, deletePost, publishPost } from '@/lib/studio/service'
import { RevisionConflictError } from '@/lib/studio/revision'

export const runtime = 'nodejs'

function notFound() {
  return new Response('Not found', { status: 404 })
}

// A stale-revision save is a conflict, not a bad request: nothing was written and
// the client can recover by reloading. The editor keys off `code`.
function errorResponse(err: unknown) {
  if (err instanceof RevisionConflictError) {
    return Response.json({ error: err.message, code: err.code }, { status: 409 })
  }
  return Response.json({ error: (err as Error).message }, { status: 400 })
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
    // Republish the standard.site record on every save. This is awaited and
    // shells out to `npm run blog ssite` with a 90s timeout, so a save is as slow
    // as that subprocess — it is not "non-blocking", as this once claimed. It is
    // also what makes adding a blueskyPostUrl in the editor land bskyPostRef on
    // the record without a second click.
    const publish = await publishPost(paths, slug)
    return Response.json({ ...result, publish })
  } catch (err) {
    return errorResponse(err)
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
