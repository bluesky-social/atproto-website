import { isProd, episodePaths } from '@/lib/studio/paths'
import { uploadAudio, setEpisodeAudio, readEpisode } from '@/lib/studio/episodeService'
import { existsSync } from 'node:fs'
import * as path from 'node:path'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ slug: string }> }

export async function POST(request: Request, { params }: Ctx) {
  if (isProd()) return new Response('Not found', { status: 404 })
  const { slug } = await params
  try {
    const paths = episodePaths()
    if (!existsSync(path.join(paths.podcastDir, slug))) {
      return Response.json({ error: `Episode not found: ${slug}` }, { status: 404 })
    }
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    // Duration is measured in the browser (from an <audio> element) and sent
    // along, so one request records the URL, size, and duration together.
    const duration = String(form.get('duration') ?? '')
    const durationSeconds = Number(form.get('durationSeconds') ?? 0)

    // The object key comes from the episode as saved on disk — publish date,
    // guests, and format — not from whatever the form is currently showing.
    const { fields: onDisk } = await readEpisode(paths, slug)

    const bytes = Buffer.from(await file.arrayBuffer())
    const uploaded = await uploadAudio(slug, bytes, {
      pubDate: onDisk.pubDate,
      guests: onDisk.guests,
      format: onDisk.format,
      // The dropped file's own name, so a differently-named file lands as a new
      // object instead of overwriting the previous one in place.
      uploadedFilename: file.name,
    })
    // Whether this replaced the object in place or wrote a new one. The editor
    // says which, because "uploaded" is indistinguishable from "nothing changed"
    // when the URL, size and duration all happen to match.
    const replacedInPlace = uploaded.audioUrl === onDisk.audioUrl
    // Persist immediately: an uploaded MP3 that only lives in browser state
    // becomes an orphaned R2 object the moment the tab navigates away.
    const { fields, revision } = await setEpisodeAudio(paths, slug, {
      ...uploaded,
      audioMimeType: 'audio/mpeg',
      // Passed straight through as measured; setEpisodeAudio decides whether the
      // pair is usable. Guarding them here as well is what let a '00:00:00'
      // duration through while durationSeconds kept its old value.
      duration,
      durationSeconds,
    })
    return Response.json({ slug, ...uploaded, fields, revision, replacedInPlace })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
