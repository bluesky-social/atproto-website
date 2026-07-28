import { isProd, studioPaths } from '@/lib/studio/paths'
import { listPosts, createPost, publishPost } from '@/lib/studio/service'

export const runtime = 'nodejs'

function notFound() {
  return new Response('Not found', { status: 404 })
}

export async function GET() {
  if (isProd()) return notFound()
  const posts = await listPosts(studioPaths())
  return Response.json({ posts })
}

export async function POST(request: Request) {
  if (isProd()) return notFound()
  try {
    const paths = studioPaths()
    const input = await request.json()
    const result = await createPost(paths, input)
    // Auto-publish the standard.site record on create (non-blocking).
    const publish = await publishPost(paths, result.slug)
    return Response.json({ ...result, publish }, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
