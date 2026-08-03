import { isProd } from '@/lib/studio/paths'
import { gitState } from '@/lib/studio/git'

export const runtime = 'nodejs'

// Read-only: reports the branch and working-tree state so the studio can show
// where a create would land before writing anything.
export async function GET() {
  if (isProd()) return new Response('Not found', { status: 404 })
  try {
    return Response.json(await gitState())
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
