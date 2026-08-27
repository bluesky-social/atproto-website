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
  listPostImages,
  savePostImage,
  type StudioPaths,
} from './service'
import { RevisionConflictError } from './revision'

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
    expect(page).toContain('mdxRouteMetadata(content)')
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
        blueskyPostUrl: '',
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
        blueskyPostUrl: '',
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
      authorDids: { 'Guest Person': 'did:plc:guest' },
    })
    const authors = JSON.parse(fs.readFileSync(paths.authorsFile, 'utf-8'))
    expect(authors['Guest Person']).toBe('did:plc:guest')
  })

  // The old field only existed on create, so an author who turned out to be
  // unknown after the post was written had to be added to authors.json by hand.
  it('adds a DID on update too, not just on create', async () => {
    await createPost(paths, {
      slug: 'later',
      title: 'T',
      description: 'D',
      date: 'June 1, 2026',
      author: 'Late Arrival',
    })
    expect(
      JSON.parse(fs.readFileSync(paths.authorsFile, 'utf-8'))['Late Arrival'],
    ).toBeUndefined()

    const opened = await readPost(paths, 'later')
    await updatePost(paths, 'later', {
      owned: opened.owned,
      body: opened.body,
      revision: opened.revision,
      authorDids: { 'Late Arrival': 'did:plc:late' },
    })
    expect(
      JSON.parse(fs.readFileSync(paths.authorsFile, 'utf-8'))['Late Arrival'],
    ).toBe('did:plc:late')
  })

  it('warns and writes nothing when the DID is malformed', async () => {
    const res = await createPost(paths, {
      slug: 'bad-did',
      title: 'T',
      description: 'D',
      date: 'June 1, 2026',
      author: 'Typo Person',
      authorDids: { 'Typo Person': 'jimray.net' },
    })
    expect(res.warning).toMatch(/Typo Person/)
    expect(
      JSON.parse(fs.readFileSync(paths.authorsFile, 'utf-8'))['Typo Person'],
    ).toBeUndefined()
    // The post itself still exists — authors.json is best-effort.
    expect(fs.existsSync(path.join(paths.blogDir, 'bad-did', 'en.mdx'))).toBe(true)
  })
})

describe('createPost partial writes', () => {
  it('removes the directory when a write fails', async () => {
    // The failure has to land *after* mkdir to exercise the rollback: a
    // duplicate slug or a bad posts.ts anchor both fail earlier, before any
    // directory exists. Making posts.ts read-only fails the last of the three
    // writes instead.
    fs.chmodSync(paths.postsFile, 0o444)
    try {
      await expect(
        createPost(paths, {
          slug: 'boom',
          title: 'T',
          description: 'D',
          date: 'June 1, 2026',
          author: 'Jim Ray',
        }),
      ).rejects.toThrow()
    } finally {
      fs.chmodSync(paths.postsFile, 0o644)
    }
    expect(fs.existsSync(path.join(paths.blogDir, 'boom'))).toBe(false)
  })

  it('keeps the post and returns a warning when authors.json cannot be written', async () => {
    // A malformed authors.json is plausible; losing a written post over it is not.
    fs.writeFileSync(paths.authorsFile, 'not json at all')
    const res = await createPost(paths, {
      slug: 'kept',
      title: 'Kept',
      description: 'D',
      date: 'June 1, 2026',
      author: 'Guest Person',
      authorDids: { 'Guest Person': 'did:plc:guest' },
    })
    expect(res.slug).toBe('kept')
    expect(res.warning).toMatch(/authors\.json/i)
    expect(fs.existsSync(path.join(paths.blogDir, 'kept', 'en.mdx'))).toBe(true)
    expect(fs.readFileSync(paths.postsFile, 'utf-8')).toContain("slug: 'kept'")
  })

  it('returns no warning on the happy path', async () => {
    const res = await createPost(paths, {
      slug: 'fine',
      title: 'Fine',
      description: 'D',
      date: 'June 1, 2026',
      author: 'Jim Ray',
    })
    expect(res.warning).toBeUndefined()
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

  // Same lost update the podcast editor had: the form holds a snapshot, the file
  // moves on, and the next save writes the snapshot back over it.
  it('refuses a save whose base revision is stale', async () => {
    const opened = await readPost(paths, 'hello')
    const mdxPath = path.join(paths.blogDir, 'hello', 'en.mdx')
    fs.writeFileSync(
      mdxPath,
      fs.readFileSync(mdxPath, 'utf-8').replace("date: 'June 1, 2026'", "date: 'July 4, 2026'"),
    )

    await expect(
      updatePost(paths, 'hello', {
        owned: opened.owned,
        body: opened.body,
        revision: opened.revision,
      }),
    ).rejects.toThrow(RevisionConflictError)

    expect(fs.readFileSync(mdxPath, 'utf-8')).toContain("date: 'July 4, 2026'")
  })

  it('returns the new revision so consecutive saves work', async () => {
    const opened = await readPost(paths, 'hello')
    const first = await updatePost(paths, 'hello', {
      owned: { ...opened.owned, title: 'One' },
      body: opened.body,
      revision: opened.revision,
    })
    expect(first.revision).not.toBe(opened.revision)
    await expect(
      updatePost(paths, 'hello', {
        owned: { ...opened.owned, title: 'Two' },
        body: opened.body,
        revision: first.revision,
      }),
    ).resolves.toBeTruthy()
  })

  it('still saves when no revision is sent, for the CLIs', async () => {
    const opened = await readPost(paths, 'hello')
    await expect(
      updatePost(paths, 'hello', {
        owned: { ...opened.owned, title: 'No precondition' },
        body: opened.body,
      }),
    ).resolves.toBeTruthy()
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
        blueskyPostUrl: '',
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
        blueskyPostUrl: '',
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

it('writes blueskyPostUrl on update, keeps it out of posts.ts, and removes it when cleared', async () => {
  await createPost(paths, {
    slug: 'thread-test',
    title: 'Thread Test',
    description: 'Desc',
    date: 'August 14, 2026',
    author: 'Jim Ray',
  })
  const mdxPath = path.join(paths.blogDir, 'thread-test', 'en.mdx')

  // A brand-new post has no thread, so the key shouldn't be in the file at all.
  expect(fs.readFileSync(mdxPath, 'utf-8')).not.toContain('blueskyPostUrl')

  const POST_URL = 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d'
  const opened = await readPost(paths, 'thread-test')
  await updatePost(paths, 'thread-test', {
    owned: { ...opened.owned, blueskyPostUrl: POST_URL },
    body: opened.body,
    revision: opened.revision,
  })
  expect(fs.readFileSync(mdxPath, 'utf-8')).toContain(`blueskyPostUrl: '${POST_URL}'`)
  expect((await readPost(paths, 'thread-test')).owned.blueskyPostUrl).toBe(POST_URL)

  // The blog index has no column for it and must not gain one — the MDX header is
  // its single home, which is why there's nothing to keep in sync.
  expect(fs.readFileSync(paths.postsFile, 'utf-8')).not.toContain('blueskyPostUrl')

  // Re-read: the update above moved the revision on.
  const withUrl = await readPost(paths, 'thread-test')
  await updatePost(paths, 'thread-test', {
    owned: { ...withUrl.owned, blueskyPostUrl: '' },
    body: withUrl.body,
    revision: withUrl.revision,
  })
  expect(fs.readFileSync(mdxPath, 'utf-8')).not.toContain('blueskyPostUrl')
})

describe('post images', () => {
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47])
  const GIF = Buffer.from([0x47, 0x49, 0x46, 0x38])

  async function makePost(slug = 'hello') {
    await createPost(paths, {
      slug,
      title: 'Hello',
      description: 'Desc',
      date: 'June 1, 2026',
      author: 'Jim Ray',
      body: 'The body.\n',
    })
    return slug
  }

  const mdxFor = (slug: string) =>
    fs.readFileSync(path.join(paths.blogDir, slug, 'en.mdx'), 'utf-8')

  it('writes the image into the post directory', async () => {
    const slug = await makePost()
    const { filename } = await savePostImage(paths, slug, PNG, 'My Chart.PNG')
    expect(filename).toBe('my-chart.png')
    const written = fs.readFileSync(path.join(paths.blogDir, slug, 'my-chart.png'))
    expect(written.equals(PNG)).toBe(true)
  })

  it('adds the import to the MDX preamble and reports the identifier', async () => {
    const slug = await makePost()
    const { identifier } = await savePostImage(paths, slug, PNG, 'pds-chart.png')
    expect(identifier).toBe('pdsChart')
    expect(mdxFor(slug)).toContain('import pdsChart from "./pds-chart.png"')
  })

  it('leaves the header and body untouched', async () => {
    // The editor may hold unsaved body edits; adding an import must not disturb
    // what is on disk beyond the preamble, or a later save conflicts with it.
    const slug = await makePost()
    const before = mdxFor(slug)
    await savePostImage(paths, slug, PNG, 'chart.png')
    const after = mdxFor(slug)
    expect(after.endsWith(before.slice(before.indexOf('export const header')))).toBe(true)
  })

  it('reads back through readPost, header intact', async () => {
    const slug = await makePost()
    await savePostImage(paths, slug, PNG, 'chart.png')
    const post = await readPost(paths, slug)
    expect(post.owned.title).toBe('Hello')
    expect(post.body.trim()).toBe('The body.')
  })

  it('returns a revision the still-open editor can save against', async () => {
    // Writing the import changes the file, so the revision the form loaded with
    // is stale. Without a fresh one, the next save is refused as a conflict.
    const slug = await makePost()
    const { revision } = await savePostImage(paths, slug, PNG, 'chart.png')
    await updatePost(paths, slug, {
      owned: { title: 'Hello', description: 'Desc', date: 'June 1, 2026', author: 'Jim Ray', blueskyPostUrl: '' },
      body: 'Edited.\n',
      revision,
    })
    expect(mdxFor(slug)).toContain('Edited.')
  })

  it('replaces the bytes and reuses the identifier on a same-name re-upload', async () => {
    const slug = await makePost()
    const first = await savePostImage(paths, slug, PNG, 'chart.png')
    const second = await savePostImage(paths, slug, GIF, 'chart.png')
    expect(second.identifier).toBe(first.identifier)
    const mdx = mdxFor(slug)
    expect(mdx.match(/import chart from/g)).toHaveLength(1)
    const written = fs.readFileSync(path.join(paths.blogDir, slug, 'chart.png'))
    expect(written.equals(GIF)).toBe(true)
  })

  it('gives a second image with a colliding name its own identifier', async () => {
    const slug = await makePost()
    await savePostImage(paths, slug, PNG, 'chart.png')
    const second = await savePostImage(paths, slug, GIF, 'chart.gif')
    expect(second.identifier).toBe('chart2')
  })

  it('refuses a post that does not exist', async () => {
    await expect(savePostImage(paths, 'nope', PNG, 'chart.png')).rejects.toThrow(
      /not found/i,
    )
  })

  it('lists images with the identifier each one is bound to', async () => {
    const slug = await makePost()
    await savePostImage(paths, slug, PNG, 'pds-chart.png')
    await savePostImage(paths, slug, GIF, 'banner.gif')
    expect(await listPostImages(paths, slug)).toEqual([
      { filename: 'banner.gif', identifier: 'banner' },
      { filename: 'pds-chart.png', identifier: 'pdsChart' },
    ])
  })

  it('omits the opengraph image, which is not an inline image', async () => {
    const slug = await makePost()
    await saveOgImage(paths.blogDir, slug, PNG, 'png')
    await savePostImage(paths, slug, PNG, 'chart.png')
    expect(await listPostImages(paths, slug)).toEqual([
      { filename: 'chart.png', identifier: 'chart' },
    ])
  })

  it('lists an image dropped in by hand, with no identifier yet', async () => {
    // A file copied into the post dir outside the studio has no import line.
    const slug = await makePost()
    fs.writeFileSync(path.join(paths.blogDir, slug, 'by-hand.png'), PNG)
    expect(await listPostImages(paths, slug)).toEqual([
      { filename: 'by-hand.png', identifier: null },
    ])
  })

  it('lists nothing for a post with no images', async () => {
    const slug = await makePost()
    expect(await listPostImages(paths, slug)).toEqual([])
  })
})
