import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import * as path from 'node:path'
import {
  parseMdxFile,
  serializeMdxFile,
  getOwnedFields,
  applyOwnedFields,
  newPostMdx,
  type OwnedFields,
} from './mdxHeader'
import {
  prependEntry,
  updateEntryBySlug,
  removeEntryBySlug,
  type PostEntry,
} from './postsFile'
import { resolveAuthorDid, withAuthor, type AuthorMap } from './authors'
import { blogPageTsx } from './templates'

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
  authorDid?: string
  body?: string
}

export type UpdateInput = { owned: OwnedFields; body: string }

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
): Promise<{ slug: string; owned: OwnedFields; body: string }> {
  const mdxPath = path.join(paths.blogDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) {
    throw new Error(`Post not found: ${slug}`)
  }
  const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
  return { slug, owned: getOwnedFields(parsed), body: parsed.body }
}

export async function createPost(
  paths: StudioPaths,
  input: CreateInput,
): Promise<{ slug: string }> {
  for (const f of ['slug', 'title', 'description', 'date', 'author'] as const) {
    if (!input[f] || !String(input[f]).trim()) {
      throw new Error(`Field "${f}" is required`)
    }
  }
  const dir = path.join(paths.blogDir, input.slug)
  if (existsSync(dir)) {
    throw new Error(`A post with slug "${input.slug}" already exists`)
  }

  const owned: OwnedFields = {
    title: input.title,
    description: input.description,
    date: input.date,
    author: input.author,
  }
  const body =
    input.body && input.body.trim()
      ? input.body
      : `# ${input.title}\n\nStart writing your post here...\n`

  // Validate the posts.ts anchor before writing any files.
  const postsSrc = await fs.readFile(paths.postsFile, 'utf-8')
  const nextPostsSrc = prependEntry(postsSrc, entryFor(input.slug, owned))

  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, 'page.tsx'), blogPageTsx(owned))
  await fs.writeFile(path.join(dir, 'en.mdx'), newPostMdx(owned, body))
  await fs.writeFile(paths.postsFile, nextPostsSrc)

  // Author DID: add to authors.json when a new author + DID was supplied.
  if (input.authorDid) {
    const authors: AuthorMap = JSON.parse(
      await fs.readFile(paths.authorsFile, 'utf-8'),
    )
    if (!resolveAuthorDid(authors, input.author)) {
      await fs.writeFile(
        paths.authorsFile,
        JSON.stringify(withAuthor(authors, input.author, input.authorDid), null, 2) + '\n',
      )
    }
  }

  return { slug: input.slug }
}

export async function updatePost(
  paths: StudioPaths,
  slug: string,
  input: UpdateInput,
): Promise<{ slug: string }> {
  const mdxPath = path.join(paths.blogDir, slug, 'en.mdx')
  if (!existsSync(mdxPath)) {
    throw new Error(`Post not found: ${slug}`)
  }
  // Re-read from disk so preamble + unknown header fields reflect the current
  // file (supports concurrent hand-edits).
  const parsed = parseMdxFile(await fs.readFile(mdxPath, 'utf-8'))
  const next = applyOwnedFields(parsed, input.owned)
  next.body = input.body
  await fs.writeFile(mdxPath, serializeMdxFile(next))

  const postsSrc = await fs.readFile(paths.postsFile, 'utf-8')
  await fs.writeFile(
    paths.postsFile,
    updateEntryBySlug(postsSrc, slug, entryFor(slug, input.owned)),
  )
  return { slug }
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
