import { isProd, studioPaths } from '@/lib/studio/paths'
import { publishPost } from '@/lib/studio/service'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ slug: string }> }

// Manual "Publish" trigger from the studio UI. Publishing itself never throws
// (publishPost returns { ok, uri?, error? }); a 400 here only means the slug
// param was unusable.
export async function POST(_request: Request, { params }: Ctx) {
  if (isProd()) return new Response('Not found', { status: 404 })
  const { slug } = await params
  try {
    const publish = await publishPost(studioPaths(), slug)
    return Response.json({ slug, publish })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
