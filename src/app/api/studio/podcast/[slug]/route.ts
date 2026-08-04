import { isProd, episodePaths } from '@/lib/studio/paths'
import { readEpisode, updateEpisode, deleteEpisode } from '@/lib/studio/episodeService'
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
    return Response.json(await readEpisode(episodePaths(), slug))
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 404 })
  }
}

export async function PUT(request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  try {
    const input = await request.json()
    return Response.json(await updateEpisode(episodePaths(), slug, input))
  } catch (err) {
    return errorResponse(err)
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  // Opt-in per deletion: the MP3 survives unless ?deleteAudio=true is passed.
  const deleteAudio =
    new URL(request.url).searchParams.get('deleteAudio') === 'true'
  try {
    return Response.json(await deleteEpisode(episodePaths(), slug, { deleteAudio }))
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
