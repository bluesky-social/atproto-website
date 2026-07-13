import { isProd, episodePaths } from '@/lib/studio/paths'
import { readEpisode, updateEpisode, deleteEpisode } from '@/lib/studio/episodeService'

export const runtime = 'nodejs'

function notFound() {
  return new Response('Not found', { status: 404 })
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
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (isProd()) return notFound()
  const { slug } = await params
  try {
    return Response.json(await deleteEpisode(episodePaths(), slug))
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
