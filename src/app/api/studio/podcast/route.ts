import { isProd } from '@/lib/studio/paths'
import { episodePaths } from '@/lib/studio/paths'
import { listEpisodes, createEpisode, nextEpisodeNumber } from '@/lib/studio/episodeService'

export const runtime = 'nodejs'

function notFound() {
  return new Response('Not found', { status: 404 })
}

export async function GET() {
  if (isProd()) return notFound()
  const paths = episodePaths()
  const [episodes, nextNumber] = await Promise.all([
    listEpisodes(paths),
    nextEpisodeNumber(paths),
  ])
  return Response.json({ episodes, nextNumber })
}

export async function POST(request: Request) {
  if (isProd()) return notFound()
  try {
    const input = await request.json()
    const result = await createEpisode(episodePaths(), input)
    return Response.json(result, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
