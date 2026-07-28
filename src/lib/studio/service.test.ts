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
  findOgImage,
  saveOgImage,
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

describe('smart typography', () => {
  it('smartens title and description everywhere createPost stores them', async () => {
    await createPost(paths, {
      slug: 'hello',
      title: '"Quoted" Title',
      description: "What's next -- a lot...",
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: 'Body.\n',
    })
    const dir = path.join(paths.blogDir, 'hello')
    for (const [label, file] of [
      ['en.mdx', path.join(dir, 'en.mdx')],
      ['posts.ts', paths.postsFile],
    ] as const) {
      const content = fs.readFileSync(file, 'utf-8')
      expect(content, label).toContain('“Quoted” Title')
      expect(content, label).toContain('What’s next — a lot…')
    }
  })

  it('does not write the title into page.tsx at all', async () => {
    // page.tsx reads the MDX header, so it must not become a third copy — that
    // duplication is what drifted before, leaving stale titles in OG previews.
    await createPost(paths, {
      slug: 'hello',
      title: 'Distinctive Title',
      description: 'Desc',
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: 'Body.\n',
    })
    const page = fs.readFileSync(path.join(paths.blogDir, 'hello', 'page.tsx'), 'utf-8')
    expect(page).not.toContain('Distinctive Title')
    expect(page).not.toContain('export const metadata')
    expect(page).toContain('content.header.title')
  })

  it('returns the smartened fields so the editor can show what was stored', async () => {
    await createPost(paths, {
      slug: 'hello',
      title: 'Plain',
      description: 'Plain',
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: 'Body.\n',
    })
    const res = await updatePost(paths, 'hello', {
      owned: {
        title: '"Quoted"',
        description: "It's fine",
        date: 'June 1, 2026',
        author: 'Jim Ray',
      },
      body: 'Body.\n',
    })
    expect(res.owned.title).toBe('“Quoted”')
    expect(res.owned.description).toBe('It’s fine')
  })

  it('smartens title and description on updatePost', async () => {
    await createPost(paths, {
      slug: 'hello',
      title: 'Plain',
      description: 'Plain',
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: 'Body.\n',
    })
    await updatePost(paths, 'hello', {
      owned: {
        title: '"Quoted"',
        description: "It's fine",
        date: 'June 1, 2026',
        author: 'Jim Ray',
      },
      body: 'Body.\n',
    })
    const mdx = fs.readFileSync(path.join(paths.blogDir, 'hello', 'en.mdx'), 'utf-8')
    expect(mdx).toContain('“Quoted”')
    expect(mdx).toContain('It’s fine')
    const posts = fs.readFileSync(paths.postsFile, 'utf-8')
    expect(posts).toContain('“Quoted”')
    expect(posts).toContain('It’s fine')
  })
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

  it('keeps a blank line between header and body when the body has no leading newline', async () => {
    await updatePost(paths, 'hello', {
      owned: {
        title: 'Hello',
        description: 'Desc',
        date: 'June 1, 2026',
        author: 'Jim Ray',
      },
      body: 'Body with no leading newline',
    })
    const mdx = fs.readFileSync(path.join(paths.blogDir, 'hello', 'en.mdx'), 'utf-8')
    // Must NOT glue the closing brace to prose (that is invalid MDX).
    expect(mdx).toContain('}\n\nBody with no leading newline')
    expect(mdx).not.toMatch(/}\S/)
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

  it('saveOgImage writes opengraph-image.<ext> and findOgImage reports it', async () => {
    expect(findOgImage(paths.blogDir, 'hello')).toBeNull()
    const res = await saveOgImage(paths.blogDir, 'hello', Buffer.from('fake-png-bytes'), 'png')
    expect(res.filename).toBe('opengraph-image.png')
    expect(findOgImage(paths.blogDir, 'hello')).toBe('opengraph-image.png')
    expect(
      fs.existsSync(path.join(paths.blogDir, 'hello', 'opengraph-image.png')),
    ).toBe(true)
    expect((await readPost(paths, 'hello')).ogImage).toBe('opengraph-image.png')
  })

  it('saveOgImage replaces an existing image so exactly one remains', async () => {
    await saveOgImage(paths.blogDir, 'hello', Buffer.from('png'), 'png')
    await saveOgImage(paths.blogDir, 'hello', Buffer.from('jpg'), 'jpg')
    const dir = path.join(paths.blogDir, 'hello')
    expect(fs.existsSync(path.join(dir, 'opengraph-image.png'))).toBe(false)
    expect(fs.existsSync(path.join(dir, 'opengraph-image.jpg'))).toBe(true)
    expect(findOgImage(paths.blogDir, 'hello')).toBe('opengraph-image.jpg')
  })
})
