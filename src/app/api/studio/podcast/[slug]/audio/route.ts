import { isProd, episodePaths } from '@/lib/studio/paths'
import { uploadAudio } from '@/lib/studio/episodeService'
import { existsSync } from 'node:fs'
import * as path from 'node:path'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ slug: string }> }

export async function POST(request: Request, { params }: Ctx) {
  if (isProd()) return new Response('Not found', { status: 404 })
  const { slug } = await params
  try {
    if (!existsSync(path.join(episodePaths().podcastDir, slug))) {
      return Response.json({ error: `Episode not found: ${slug}` }, { status: 404 })
    }
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    const bytes = Buffer.from(await file.arrayBuffer())
    const result = await uploadAudio(slug, bytes)
    return Response.json({ slug, ...result })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
