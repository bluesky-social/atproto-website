import { isProd, studioPaths } from '@/lib/studio/paths'
import { listPosts, createPost } from '@/lib/studio/service'

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
    const input = await request.json()
    const result = await createPost(studioPaths(), input)
    return Response.json(result, { status: 201 })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
