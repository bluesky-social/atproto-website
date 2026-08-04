import { isProd, studioPaths } from '@/lib/studio/paths'
import { listPosts, createPost, publishPost } from '@/lib/studio/service'
import { gitState, createBranch } from '@/lib/studio/git'
import { readAuthors } from '@/lib/studio/authorsFile'

export const runtime = 'nodejs'

function notFound() {
  return new Response('Not found', { status: 404 })
}

export async function GET() {
  if (isProd()) return notFound()
  const paths = studioPaths()
  // See the podcast route: refreshes with the list the editor already fetches.
  const [posts, knownAuthors] = await Promise.all([
    listPosts(paths),
    readAuthors(paths.authorsFile),
  ])
  return Response.json({ posts, knownAuthors })
}

export async function POST(request: Request) {
  if (isProd()) return notFound()
  // Declared outside the try so a later failure can still report that a branch
  // was created — the author needs to know which branch they are now on.
  let branch: { created: true; name: string } | undefined
  try {
    const paths = studioPaths()
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

    const result = await createPost(paths, input)
    // Auto-publish the standard.site record on create (non-blocking).
    const publish = await publishPost(paths, result.slug)
    return Response.json({ ...result, publish, branch }, { status: 201 })
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
