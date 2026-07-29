import { isProd } from '@/lib/studio/paths'
import { episodePaths } from '@/lib/studio/paths'
import { listEpisodes, createEpisode, nextEpisodeNumber } from '@/lib/studio/episodeService'
import { gitState, createBranch } from '@/lib/studio/git'

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
  // Declared outside the try so a later failure can still report that a branch
  // was created — the author needs to know which branch they are now on.
  let branch: { created: true; name: string } | undefined
  try {
    const input = await request.json()
    const requested = input.branch as { name?: string } | undefined

    if (requested?.name) {
      // Re-check rather than trusting the form's snapshot: files may have
      // changed since it was opened.
      const state = await gitState()
      if (state.dirty) {
        return Response.json(
          {
            error: `Working tree has uncommitted changes (${state.files.length} file(s)). Commit or stash them, or create without a branch.`,
            files: state.files,
          },
          { status: 409 },
        )
      }
      await createBranch(requested.name)
      branch = { created: true, name: requested.name }
    }

    const result = await createEpisode(episodePaths(), input)
    return Response.json({ ...result, branch }, { status: 201 })
  } catch (err) {
    const message = (err as Error).message
    return Response.json(
      {
        error: branch
          ? `${message} — you are now on branch ${branch.name}`
          : message,
        branch,
      },
      { status: 400 },
    )
  }
}
