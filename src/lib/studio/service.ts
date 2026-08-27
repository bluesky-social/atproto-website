import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import * as path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import {
  parseMdxFile,
  serializeMdxFile,
  getOwnedFields,
  getHeaderField,
  applyOwnedFields,
  newPostMdx,
  normalizeBodySeparation,
  type OwnedFields,
} from './mdxHeader'

const execFileAsync = promisify(execFile)
import {
  prependEntry,
  updateEntryBySlug,
  removeEntryBySlug,
  type PostEntry,
} from './postsFile'
import { fileRevision, assertRevision } from './revision'
import { applyAuthorDids } from './authorsFile'
import { blogPageTsx } from './templates'
import { smartenTitleAndDescription } from './smartText'
import {
  POST_IMAGE_EXTS,
  sanitizeImageFilename,
  parsePreambleImports,
  addPreambleImport,
} from './postImages'

export type StudioPaths = {
  blogDir: string
  postsFile: string
  authorsFile: string
}

export type CreateInput = {
  slug: string
  title: string
  description: string
  date: string
  author: string
  /**
   * Name → DID for authors authors.json doesn't know yet. A map rather than a
   * single DID so the same shape works for episodes, which have several names.
   */
  authorDids?: Record<string, string>
  body?: string
}

export type UpdateInput = {
  owned: OwnedFields
  body: string
  /** Base revision from readPost; omit for no precondition. See ./revision. */
  revision?: string
  /**
   * Name → DID for authors authors.json doesn't know yet. Accepted on update as
   * well as create: an author can turn out to be unknown long after the post was
   * written, which previously meant editing authors.json by hand.
   */
  authorDids?: Record<string, string>
}

function entryFor(slug: string, owned: OwnedFields): PostEntry {
  return {
    slug,
    title: owned.title,
    description: owned.description,
    date: owned.date,
    author: owned.author || undefined,
  }
}

export async function listPosts(
  paths: StudioPaths,
): Promise<{ slug: string; title: string; date: string }[]> {
  const dirents = await fs.readdir(paths.blogDir, { withFileTypes: true })
  const out: { slug: string; title: string; date: string }[] = []
  for (const d of dirents) {
    if (!d.isDirectory()) continue
    const mdxPath = path.join(paths.blogDir, d.name, 'en.mdx')
    if (!existsSync(mdxPath)) continue
    try {
      const owned = getOwnedFields(parseMdxFile(await fs.readFile(mdxPath, 'utf-8')))
      out.push({ slug: d.name, title: owned.title || d.name, date: owned.date })
    } catch {
      out.push({ slug: d.name, title: d.name, date: '' })
    }
  }
  // Reverse-chronological (newest first); fall back to slug when a date is
  // missing or unparseable so ordering stays deterministic.
  return out.sort((a, b) => {
    const ta = Date.parse(a.date)
    const tb = Date.parse(b.date)
    const aOk = !Number.isNaN(ta)
    const bOk = !Number.isNaN(tb)
    if (aOk && bOk && ta !== tb) return tb - ta
    if (aOk !== bOk) return aOk ? -1 : 1
    return a.slug.localeCompare(b.slug)
  })
}

export async function readPost(
  paths: StudioPaths,
  slug: string,
): Promise<{
  slug: string
  owned: OwnedFields
  body: string
  standardSiteUri: string
  ogImage: string | null
  revision: string
}> {
  const mdxPath = path.join(paths.blogDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) {
    throw new Error(`Post not found: ${slug}`)
  }
  const raw = await fs.readFile(mdxPath, 'utf-8')
  const parsed = parseMdxFile(raw)
  return {
    slug,
    owned: getOwnedFields(parsed),
    // Strip the leading blank-line separator between the header and the body so
    // the editor doesn't show phantom empty lines; save re-adds it via
    // normalizeBodySeparation.
    body: parsed.body.replace(/^\n+/, ''),
    standardSiteUri: getHeaderField(parsed, 'standardSiteUri'),
    ogImage: findOgImage(paths.blogDir, slug),
    // Fingerprint of exactly the bytes these fields were parsed from, so a save
    // can prove it is editing the version it was shown.
    revision: fileRevision(raw),
  }
}

// Next's opengraph-image file convention supports these extensions.
export const OG_IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif'] as const
export type OgImageExt = (typeof OG_IMAGE_EXTS)[number]

// Basename of the post's opengraph-image.* if one exists, else null.
export function findOgImage(dir: string, slug: string): string | null {
  for (const ext of OG_IMAGE_EXTS) {
    const name = `opengraph-image.${ext}`
    if (existsSync(path.join(dir, slug, name))) return name
  }
  return null
}

// Writes the post's OG image as opengraph-image.<ext>, removing any existing
// opengraph-image.* first so exactly one remains (Next only uses one).
export async function saveOgImage(
  dir: string,
  slug: string,
  bytes: Buffer,
  ext: OgImageExt,
): Promise<{ filename: string }> {
  const postDir = path.join(dir, slug)
  if (!existsSync(postDir)) throw new Error(`Post not found: ${slug}`)
  for (const e of OG_IMAGE_EXTS) {
    const p = path.join(postDir, `opengraph-image.${e}`)
    if (existsSync(p)) await fs.rm(p)
  }
  const filename = `opengraph-image.${ext}`
  await fs.writeFile(path.join(postDir, filename), bytes)
  return { filename }
}

export type PostImage = { filename: string; identifier: string | null }

// True for a file the post's body could import as an inline image. The
// opengraph-image is excluded: Next reads it as the post's social card, and it
// is managed by its own dropzone.
function isInlineImage(name: string): boolean {
  if (name.startsWith('opengraph-image.')) return false
  const ext = name.split('.').pop()?.toLowerCase()
  return !!ext && (POST_IMAGE_EXTS as readonly string[]).includes(ext)
}

/**
 * The post's inline images, each paired with the identifier its preamble binds.
 *
 * `identifier` is null for an image with no import line — a file copied into the
 * post directory by hand. It is listed rather than hidden, because an image the
 * studio can't see is exactly the one an author would go looking for.
 */
export async function listPostImages(
  paths: StudioPaths,
  slug: string,
): Promise<PostImage[]> {
  const postDir = path.join(paths.blogDir, slug)
  if (!existsSync(postDir)) throw new Error(`Post not found: ${slug}`)
  const names = (await fs.readdir(postDir)).filter(isInlineImage).sort()

  const mdxPath = path.join(postDir, 'en.mdx')
  let byFile = new Map<string, string>()
  if (existsSync(mdxPath)) {
    try {
      const { preamble } = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
      byFile = new Map(
        parsePreambleImports(preamble).map((i) => [i.file, i.identifier]),
      )
    } catch {
      // An unparseable header is the editor's problem to report, not a reason
      // to hide the files that are plainly sitting there.
    }
  }
  return names.map((filename) => ({
    filename,
    identifier: byFile.get(`./${filename}`) ?? null,
  }))
}

/**
 * Store an inline image in the post directory and bind it in the MDX preamble.
 *
 * Returns the identifier the body should reference and a fresh `revision`:
 * writing the import changes en.mdx, so the revision the open editor loaded
 * with is stale, and its next save would be refused as a conflict.
 *
 * Only the preamble is touched. The editor may be holding unsaved body edits,
 * and rewriting the body from disk would quietly undo them.
 */
export async function savePostImage(
  paths: StudioPaths,
  slug: string,
  bytes: Buffer,
  name: string,
  ext?: string,
): Promise<{ filename: string; identifier: string; revision: string }> {
  const postDir = path.join(paths.blogDir, slug)
  const mdxPath = path.join(postDir, 'en.mdx')
  if (!existsSync(mdxPath)) throw new Error(`Post not found: ${slug}`)

  // Parse before writing anything: a header this can't read means no import can
  // be added, and an image with no import is just litter in the post directory.
  const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
  const filename = sanitizeImageFilename(name, ext)
  const { preamble, identifier } = addPreambleImport(parsed.preamble, filename)

  await fs.writeFile(path.join(postDir, filename), bytes)
  const serialized = serializeMdxFile({ ...parsed, preamble })
  await fs.writeFile(mdxPath, serialized)

  return { filename, identifier, revision: fileRevision(serialized) }
}

export type PublishResult = { ok: boolean; uri?: string; error?: string }

// Publishes/updates the post's standard.site record by shelling out to the
// existing, battle-tested CLI (`npm run blog ssite <slug>`), which loads .env
// itself and writes `standardSiteUri` back into the post's en.mdx. We shell out
// rather than import publish-post.mjs because it uses @atproto/lex plus a JSON
// import-assertion that the Next webpack bundler can't handle. Never throws:
// a publish failure is returned so create/save can warn-and-continue.
export async function publishPost(
  paths: StudioPaths,
  slug: string,
): Promise<PublishResult> {
  try {
    await execFileAsync('npm', ['run', 'blog', 'ssite', slug], {
      cwd: process.cwd(),
      timeout: 90_000,
    })
  } catch (err) {
    const e = err as { stderr?: string; message?: string }
    const msg = (e.stderr || e.message || 'publish failed')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .pop()
    return { ok: false, error: msg || 'publish failed' }
  }
  // The CLI wrote standardSiteUri back into the header; read it out.
  try {
    const mdxPath = path.join(paths.blogDir, slug, 'en.mdx')
    const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
    return { ok: true, uri: getHeaderField(parsed, 'standardSiteUri') }
  } catch {
    return { ok: true }
  }
}

export async function createPost(
  paths: StudioPaths,
  input: CreateInput,
): Promise<{ slug: string; warning?: string }> {
  for (const f of ['slug', 'title', 'description', 'date', 'author'] as const) {
    if (!input[f] || !String(input[f]).trim()) {
      throw new Error(`Field "${f}" is required`)
    }
  }
  const dir = path.join(paths.blogDir, input.slug)
  if (existsSync(dir)) {
    throw new Error(`A post with slug "${input.slug}" already exists`)
  }

  // Smarten here: page.tsx, en.mdx, and the posts.ts entry are all written from
  // this one object, so the three copies can't disagree.
  const owned: OwnedFields = smartenTitleAndDescription({
    title: input.title,
    description: input.description,
    date: input.date,
    author: input.author,
    // A new post has no Bluesky thread yet; it's added from the editor once the
    // post is live and the thread exists. newPostMdx omits the key when empty.
    blueskyPostUrl: '',
  })
  const body =
    input.body && input.body.trim()
      ? input.body
      : // No leading `# ${title}` — the page renders the title itself, so an H1
        // here would be redundant.
        `Start writing your post here...\n`

  // Validate the posts.ts anchor before writing any files.
  const postsSrc = await fs.readFile(paths.postsFile, 'utf-8')
  const nextPostsSrc = prependEntry(postsSrc, entryFor(input.slug, owned))

  await fs.mkdir(dir, { recursive: true })
  try {
    await fs.writeFile(path.join(dir, 'page.tsx'), blogPageTsx())
    await fs.writeFile(path.join(dir, 'en.mdx'), newPostMdx(owned, body))
    await fs.writeFile(paths.postsFile, nextPostsSrc)
  } catch (err) {
    // Roll back the partially-created directory so a retry isn't blocked, and so
    // a failed create never leaves half a post behind. Matches createEpisode.
    // posts.ts is written last, so a failure never leaves an entry pointing at a
    // missing directory.
    await fs.rm(dir, { recursive: true, force: true })
    throw err
  }

  // Everything past this point is best-effort: the post exists, so a failure
  // here is a warning rather than an error. Reporting it as an error would tell
  // the author the post wasn't created when it was.
  const reason = await applyAuthorDids(paths.authorsFile, input.authorDids)
  const warning = reason ? `Post created, but ${reason}` : undefined

  return warning ? { slug: input.slug, warning } : { slug: input.slug }
}

export async function updatePost(
  paths: StudioPaths,
  slug: string,
  input: UpdateInput,
): Promise<{
  slug: string
  owned: OwnedFields
  revision: string
  warning?: string
}> {
  const mdxPath = path.join(paths.blogDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) {
    throw new Error(`Post not found: ${slug}`)
  }
  // Re-read from disk so preamble + unknown header fields reflect the current
  // file (supports concurrent hand-edits). That only ever protected the fields
  // the editor doesn't own; the revision check is what protects the rest.
  const owned = smartenTitleAndDescription(input.owned)
  const raw = await fs.readFile(mdxPath, 'utf-8')
  // Check before the first write, so a refusal leaves both files untouched.
  assertRevision(input.revision, fileRevision(raw), 'This post')
  const parsed = parseMdxFile(raw)
  const next = applyOwnedFields(parsed, owned)
  next.body = normalizeBodySeparation(input.body)
  const serialized = serializeMdxFile(next)
  await fs.writeFile(mdxPath, serialized)

  const postsSrc = await fs.readFile(paths.postsFile, 'utf-8')
  await fs.writeFile(
    paths.postsFile,
    updateEntryBySlug(postsSrc, slug, entryFor(slug, owned)),
  )
  // Hand back what was actually stored — the editor echoes the smartened title
  // and description so the transform is visible rather than silent — plus the
  // revision it just created, so the still-open form can save again without
  // conflicting with itself.
  // Best-effort, like createPost: the post is written, so a byline link that
  // couldn't be recorded is a warning rather than a failure.
  const reason = await applyAuthorDids(paths.authorsFile, input.authorDids)

  return {
    slug,
    owned,
    revision: fileRevision(serialized),
    ...(reason ? { warning: `Post saved, but ${reason}` } : {}),
  }
}

export async function deletePost(
  paths: StudioPaths,
  slug: string,
): Promise<{ slug: string; dirRemoved: boolean; entryRemoved: boolean }> {
  const dir = path.join(paths.blogDir, slug)
  const dirRemoved = existsSync(dir)
  if (dirRemoved) await fs.rm(dir, { recursive: true, force: true })

  const postsSrc = await fs.readFile(paths.postsFile, 'utf-8')
  const nextPostsSrc = removeEntryBySlug(postsSrc, slug)
  const entryRemoved = nextPostsSrc !== postsSrc
  if (entryRemoved) await fs.writeFile(paths.postsFile, nextPostsSrc)

  return { slug, dirRemoved, entryRemoved }
}
