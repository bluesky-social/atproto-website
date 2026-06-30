import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  listPosts,
  readPost,
  createPost,
  updatePost,
  deletePost,
  type StudioPaths,
} from './service'

let root: string
let paths: StudioPaths

const POSTS_SRC = `export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author?: string
}

export const posts: BlogPost[] = [
]
`

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-'))
  const blogDir = path.join(root, 'blog')
  fs.mkdirSync(blogDir, { recursive: true })
  const postsFile = path.join(root, 'posts.ts')
  const authorsFile = path.join(root, 'authors.json')
  fs.writeFileSync(postsFile, POSTS_SRC)
  fs.writeFileSync(authorsFile, JSON.stringify({ 'Jim Ray': 'did:plc:jim' }, null, 2))
  paths = { blogDir, postsFile, authorsFile }
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('createPost', () => {
  it('writes the dir, page.tsx, en.mdx, and a posts.ts entry', async () => {
    await createPost(paths, {
      slug: 'hello',
      title: 'Hello',
      description: 'Desc',
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: '# Hello\n\nBody.\n',
    })
    const dir = path.join(paths.blogDir, 'hello')
    expect(fs.existsSync(path.join(dir, 'page.tsx'))).toBe(true)
    const mdx = fs.readFileSync(path.join(dir, 'en.mdx'), 'utf-8')
    expect(mdx).toContain("title: 'Hello'")
    expect(mdx).toContain('Body.')
    expect(fs.readFileSync(paths.postsFile, 'utf-8')).toContain("slug: 'hello'")
  })

  it('rejects a duplicate slug', async () => {
    const input = {
      slug: 'dup',
      title: 'T',
      description: 'D',
      date: 'June 1, 2026',
      author: 'Jim Ray',
    }
    await createPost(paths, input)
    await expect(createPost(paths, input)).rejects.toThrow(/exists/i)
  })

  it('rejects missing required fields', async () => {
    await expect(
      createPost(paths, {
        slug: 'x',
        title: '',
        description: 'D',
        date: 'June 1, 2026',
        author: 'Jim Ray',
      }),
    ).rejects.toThrow(/required/i)
  })

  it('adds an unknown author + DID to authors.json', async () => {
    await createPost(paths, {
      slug: 'guest',
      title: 'T',
      description: 'D',
      date: 'June 1, 2026',
      author: 'Guest Person',
      authorDid: 'did:plc:guest',
    })
    const authors = JSON.parse(fs.readFileSync(paths.authorsFile, 'utf-8'))
    expect(authors['Guest Person']).toBe('did:plc:guest')
  })
})

describe('read/update/list/delete', () => {
  beforeEach(async () => {
    await createPost(paths, {
      slug: 'hello',
      title: 'Hello',
      description: 'Desc',
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: '# Hello\n\nBody.\n',
    })
  })

  it('lists posts by scanning for en.mdx', async () => {
    const list = await listPosts(paths)
    expect(list).toEqual([{ slug: 'hello', title: 'Hello', date: 'June 1, 2026' }])
  })

  it('lists posts newest-first (reverse-chronological)', async () => {
    await createPost(paths, {
      slug: 'older',
      title: 'Older',
      description: 'D',
      date: 'January 1, 2026',
      author: 'Jim Ray',
    })
    await createPost(paths, {
      slug: 'newer',
      title: 'Newer',
      description: 'D',
      date: 'December 1, 2026',
      author: 'Jim Ray',
    })
    const slugs = (await listPosts(paths)).map((p) => p.slug)
    // 'hello' (June 1) is created by the surrounding beforeEach
    expect(slugs).toEqual(['newer', 'hello', 'older'])
  })

  it('reads owned fields and body', async () => {
    const post = await readPost(paths, 'hello')
    expect(post.owned.title).toBe('Hello')
    expect(post.body).toContain('Body.')
  })

  it('updates owned fields + body, preserving unknown header fields', async () => {
    // Inject an unknown field by hand to prove preservation.
    const mdxPath = path.join(paths.blogDir, 'hello', 'en.mdx')
    const withExtra = fs
      .readFileSync(mdxPath, 'utf-8')
      .replace(
        'export const header = {\n',
        "export const header = {\n  standardSiteUri: 'at://x',\n",
      )
    fs.writeFileSync(mdxPath, withExtra)

    await updatePost(paths, 'hello', {
      owned: {
        title: 'Hello (edited)',
        description: 'Desc',
        date: 'June 1, 2026',
        author: 'Jim Ray',
      },
      body: '\n\nNew body.\n',
    })
    const mdx = fs.readFileSync(mdxPath, 'utf-8')
    expect(mdx).toContain("title: 'Hello (edited)'")
    expect(mdx).toContain("standardSiteUri: 'at://x'")
    expect(mdx).toContain('New body.')
    expect(fs.readFileSync(paths.postsFile, 'utf-8')).toContain("title: 'Hello (edited)'")
  })

  it('deletes the dir and posts.ts entry', async () => {
    const res = await deletePost(paths, 'hello')
    expect(res.dirRemoved).toBe(true)
    expect(fs.existsSync(path.join(paths.blogDir, 'hello'))).toBe(false)
    expect(fs.readFileSync(paths.postsFile, 'utf-8')).not.toContain("slug: 'hello'")
  })

  it('deletePost is idempotent — tolerates missing dir and absent entry', async () => {
    const res = await deletePost(paths, 'nonexistent')
    expect(res.dirRemoved).toBe(false)
    expect(res.entryRemoved).toBe(false)
    // returns flags, does not throw
  })
})
