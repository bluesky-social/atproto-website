import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  listEpisodes,
  nextEpisodeNumber,
  readEpisode,
  createEpisode,
  updateEpisode,
  deleteEpisode,
  setEpisodeAudio,
  type CreateEpisodeInput,
} from './episodeService'
import { RevisionConflictError, fileRevision } from './revision'
import type { EpisodePaths } from './paths'

let root: string
let paths: EpisodePaths

const EPISODES_SRC = `export interface Episode { slug: string }

export const episodes: Episode[] = [
]
`

function baseInput(over: Partial<CreateEpisodeInput> = {}): CreateEpisodeInput {
  return {
    slug: 'my-ep',
    title: 'My Episode',
    description: 'Desc',
    date: 'July 10, 2026',
    hosts: ['Jim Ray'],
    guests: [],
    duration: '00:10:00',
    durationSeconds: 600,
    audioUrl: 'https://media.atproto.com/off-protocol/my-ep/my-ep.mp3',
    audioSizeBytes: 1000,
    explicit: false,
    blueskyPostUrl: '',
    body: 'Show notes.',
    ...over,
  }
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'epstudio-'))
  const podcastDir = path.join(root, 'off-protocol')
  fs.mkdirSync(podcastDir, { recursive: true })
  const episodesFile = path.join(root, 'episodes.ts')
  fs.writeFileSync(episodesFile, EPISODES_SRC)
  const authorsFile = path.join(root, 'authors.json')
  fs.writeFileSync(authorsFile, JSON.stringify({ 'Jim Ray': 'did:plc:jim' }, null, 2))
  paths = { podcastDir, episodesFile, authorsFile }
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

describe('createEpisode', () => {
  it('writes page.tsx, en.mdx, transcript.mdx, and an episodes.ts entry', async () => {
    await createEpisode(paths, baseInput())
    const dir = path.join(paths.podcastDir, 'my-ep')
    expect(fs.existsSync(path.join(dir, 'page.tsx'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'transcript.mdx'))).toBe(true)
    const mdx = fs.readFileSync(path.join(dir, 'en.mdx'), 'utf-8')
    expect(mdx).toContain("title: 'My Episode'")
    expect(mdx).toContain("hosts: ['Jim Ray']")
    expect(mdx).toContain('Show notes.')
    const eps = fs.readFileSync(paths.episodesFile, 'utf-8')
    expect(eps).toContain("slug: 'my-ep'")
    expect(eps).not.toContain('hosts:') // MDX-only
  })

  it('assigns episodeNumber = max + 1', async () => {
    await createEpisode(paths, baseInput({ slug: 'a', title: 'A' }))
    await createEpisode(paths, baseInput({ slug: 'b', title: 'B' }))
    const eps = fs.readFileSync(paths.episodesFile, 'utf-8')
    expect(eps).toContain('episodeNumber: 2,')
    expect(eps).toContain('episodeNumber: 1,')
  })

  it('uses a supplied pubDate instead of stamping now', async () => {
    await createEpisode(paths, baseInput({ pubDate: '2026-03-01T15:00:00.000Z' }))
    const mdx = fs.readFileSync(path.join(paths.podcastDir, 'my-ep', 'en.mdx'), 'utf-8')
    expect(mdx).toContain("pubDate: '2026-03-01T15:00:00.000Z',")
    expect(fs.readFileSync(paths.episodesFile, 'utf-8')).toContain(
      "pubDate: '2026-03-01T15:00:00.000Z',",
    )
  })

  it('stamps pubDate when none is supplied', async () => {
    await createEpisode(paths, baseInput())
    const { fields } = await readEpisode(paths, 'my-ep')
    expect(fields.pubDate).not.toBe('')
    expect(Number.isNaN(new Date(fields.pubDate).getTime())).toBe(false)
  })

  it('smartens the title and description everywhere it stores them', async () => {
    await createEpisode(
      paths,
      baseInput({
        title: '"Nothing Is Ever Over"',
        description: "What's next -- a lot, it turns out...",
      }),
    )
    const dir = path.join(paths.podcastDir, 'my-ep')
    const mdx = fs.readFileSync(path.join(dir, 'en.mdx'), 'utf-8')
    const eps = fs.readFileSync(paths.episodesFile, 'utf-8')
    for (const [label, content] of [
      ['en.mdx', mdx],
      ['episodes.ts', eps],
    ] as const) {
      expect(content, label).toContain('“Nothing Is Ever Over”')
      expect(content, label).toContain('What’s next — a lot, it turns out…')
    }
  })

  it('does not write the title into page.tsx at all', async () => {
    // page.tsx reads the MDX header, so it must not become a third copy — that
    // duplication is what drifted before, leaving stale titles in OG previews.
    await createEpisode(paths, baseInput({ title: 'Distinctive Title' }))
    const page = fs.readFileSync(
      path.join(paths.podcastDir, 'my-ep', 'page.tsx'),
      'utf-8',
    )
    expect(page).not.toContain('Distinctive Title')
    expect(page).not.toContain('export const metadata')
    expect(page).toContain('mdxRouteMetadata(notes)')
  })

  it('writes the requested format to both en.mdx and episodes.ts', async () => {
    await createEpisode(paths, baseInput({ format: 'livestream' }))
    const mdx = fs.readFileSync(path.join(paths.podcastDir, 'my-ep', 'en.mdx'), 'utf-8')
    expect(mdx).toContain("format: 'livestream',")
    expect(fs.readFileSync(paths.episodesFile, 'utf-8')).toContain("format: 'livestream',")
  })

  it('defaults to conversation when no format is given', async () => {
    await createEpisode(paths, baseInput())
    expect(await readEpisode(paths, 'my-ep').then((e) => e.fields.format)).toBe(
      'conversation',
    )
  })

  it('rejects a duplicate slug', async () => {
    await createEpisode(paths, baseInput())
    await expect(createEpisode(paths, baseInput())).rejects.toThrow(/exists/i)
  })

  it('rejects missing required fields', async () => {
    await expect(createEpisode(paths, baseInput({ title: '' }))).rejects.toThrow(/required/i)
  })
})

describe('read/update/delete/list', () => {
  beforeEach(async () => {
    await createEpisode(paths, baseInput())
  })

  it('reads fields + body', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    expect(ep.fields.title).toBe('My Episode')
    expect(ep.fields.hosts).toEqual(['Jim Ray'])
    expect(ep.body).toContain('Show notes.')
  })

  it('updates fields + body, preserving unknown header keys', async () => {
    const mdxPath = path.join(paths.podcastDir, 'my-ep', 'en.mdx')
    fs.writeFileSync(
      mdxPath,
      fs.readFileSync(mdxPath, 'utf-8').replace(
        'export const header = {\n',
        "export const header = {\n  coverImage: 'https://x/c.png',\n",
      ),
    )
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', {
      fields: { ...ep.fields, title: 'Renamed' },
      body: 'New notes.',
    })
    const mdx = fs.readFileSync(mdxPath, 'utf-8')
    expect(mdx).toContain("title: 'Renamed'")
    expect(mdx).toContain("coverImage: 'https://x/c.png'")
    expect(mdx).toContain('New notes.')
    expect(fs.readFileSync(paths.episodesFile, 'utf-8')).toContain("title: 'Renamed'")
  })

  // Reproduces how episode 14's pubDate was reverted: the editor loaded the
  // episode, the file changed underneath it, and the next save wrote the stale
  // snapshot back over both files.
  it('refuses a save whose base revision is stale', async () => {
    const opened = await readEpisode(paths, 'my-ep')

    // Someone else corrects the pubDate while the form sits open.
    const mdxPath = path.join(paths.podcastDir, 'my-ep', 'en.mdx')
    fs.writeFileSync(
      mdxPath,
      fs
        .readFileSync(mdxPath, 'utf-8')
        .replace(/pubDate: '[^']*'/, "pubDate: '2026-08-03T22:18:49.823Z'"),
    )

    await expect(
      updateEpisode(paths, 'my-ep', {
        fields: opened.fields,
        body: opened.body,
        revision: opened.revision,
      }),
    ).rejects.toThrow(RevisionConflictError)

    // The refusal must be total: the correction survives.
    expect(fs.readFileSync(mdxPath, 'utf-8')).toContain(
      "pubDate: '2026-08-03T22:18:49.823Z'",
    )
  })

  it('accepts a save whose base revision is current', async () => {
    const opened = await readEpisode(paths, 'my-ep')
    await expect(
      updateEpisode(paths, 'my-ep', {
        fields: { ...opened.fields, title: 'Renamed' },
        body: opened.body,
        revision: opened.revision,
      }),
    ).resolves.toMatchObject({ slug: 'my-ep' })
  })

  // Without this, a second save from the same open tab would conflict with the
  // tab's own first save.
  it('returns the new revision so consecutive saves work', async () => {
    const opened = await readEpisode(paths, 'my-ep')
    const first = await updateEpisode(paths, 'my-ep', {
      fields: { ...opened.fields, title: 'One' },
      body: opened.body,
      revision: opened.revision,
    })
    expect(first.revision).not.toBe(opened.revision)
    await expect(
      updateEpisode(paths, 'my-ep', {
        fields: { ...opened.fields, title: 'Two' },
        body: opened.body,
        revision: first.revision,
      }),
    ).resolves.toBeTruthy()
  })

  // The audio route writes en.mdx itself, and the editor merges back only the
  // audio fields so in-progress edits survive. Without a fresh revision the form
  // would be stale the moment an upload finished, and the next save would be
  // refused for no good reason.
  it('setEpisodeAudio returns a revision the open form can keep saving with', async () => {
    const opened = await readEpisode(paths, 'my-ep')
    const after = await setEpisodeAudio(paths, 'my-ep', {
      audioUrl: 'https://media/new.mp3',
      audioSizeBytes: 99,
    })
    // Must be the fingerprint of what is actually on disk now — not merely
    // "different from before", which undefined would satisfy for free.
    const onDisk = fs.readFileSync(
      path.join(paths.podcastDir, 'my-ep', 'en.mdx'),
      'utf-8',
    )
    expect(after.revision).toBe(fileRevision(onDisk))
    await expect(
      updateEpisode(paths, 'my-ep', {
        fields: { ...opened.fields, title: 'Edited after upload' },
        body: opened.body,
        revision: after.revision,
      }),
    ).resolves.toBeTruthy()
  })

  it('still saves when no revision is sent, for the CLIs', async () => {
    const opened = await readEpisode(paths, 'my-ep')
    await expect(
      updateEpisode(paths, 'my-ep', {
        fields: { ...opened.fields, title: 'No precondition' },
        body: opened.body,
      }),
    ).resolves.toBeTruthy()
  })

  it('preserves format across an update that does not mention it', async () => {
    await updateEpisode(paths, 'my-ep', {
      fields: { ...(await readEpisode(paths, 'my-ep')).fields, format: 'ama' },
      body: 'Notes.',
    })
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', { fields: ep.fields, body: ep.body })
    expect((await readEpisode(paths, 'my-ep')).fields.format).toBe('ama')
  })

  // The editor's local Fields type gains `format` in a later task. Until it
  // does — and for any other client that omits it — the server must not write
  // `format: 'undefined'` into the header.
  it('normalizes a missing format on update instead of writing undefined', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    const withoutFormat = { ...ep.fields } as Record<string, unknown>
    delete withoutFormat.format
    await updateEpisode(paths, 'my-ep', {
      fields: withoutFormat as typeof ep.fields,
      body: ep.body,
    })
    const mdx = fs.readFileSync(path.join(paths.podcastDir, 'my-ep', 'en.mdx'), 'utf-8')
    expect(mdx).toContain("format: 'conversation',")
    expect(mdx).not.toContain('undefined')
  })

  it('returns the smartened fields so the editor can show what was stored', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    const res = await updateEpisode(paths, 'my-ep', {
      fields: { ...ep.fields, title: '"Quoted"', description: "It's fine" },
      body: 'Notes.',
    })
    expect(res.fields.title).toBe('“Quoted”')
    expect(res.fields.description).toBe('It’s fine')
  })

  it('smartens the title and description on update', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', {
      fields: { ...ep.fields, title: '"Quoted"', description: "It's fine" },
      body: 'Notes.',
    })
    const mdx = fs.readFileSync(path.join(paths.podcastDir, 'my-ep', 'en.mdx'), 'utf-8')
    expect(mdx).toContain('“Quoted”')
    expect(mdx).toContain('It’s fine')
    const eps = fs.readFileSync(paths.episodesFile, 'utf-8')
    expect(eps).toContain('“Quoted”')
    expect(eps).toContain('It’s fine')
  })

  it('lists newest-first and computes nextEpisodeNumber', async () => {
    expect(await nextEpisodeNumber(paths)).toBe(2)
    const list = await listEpisodes(paths)
    expect(list[0].slug).toBe('my-ep')
  })

  it('deletes dir + entry, idempotently', async () => {
    const res = await deleteEpisode(paths, 'my-ep')
    expect(res.dirRemoved).toBe(true)
    expect(res.entryRemoved).toBe(true)
    expect(fs.existsSync(path.join(paths.podcastDir, 'my-ep'))).toBe(false)
    const again = await deleteEpisode(paths, 'my-ep')
    expect(again.dirRemoved).toBe(false)
    expect(again.entryRemoved).toBe(false)
  })

  describe('deleteEpisode with deleteAudio', () => {
    const AUDIO = 'https://media.atproto.com/off-protocol/2026-07-10-my-ep/my-ep.mp3'
    let prevEnv: NodeJS.ProcessEnv

    beforeEach(async () => {
      prevEnv = { ...process.env }
      Object.assign(process.env, {
        CLOUDFLARE_ACCOUNT_ID: 'acct',
        R2_ACCESS_KEY_ID: 'ak',
        R2_SECRET_ACCESS_KEY: 'sk',
        R2_BUCKET: 'bucket',
        R2_PUBLIC_BASE: 'https://media.atproto.com',
      })
      const ep = await readEpisode(paths, 'my-ep')
      await updateEpisode(paths, 'my-ep', {
        fields: { ...ep.fields, audioUrl: AUDIO },
        body: 'Notes.',
      })
    })

    afterEach(() => {
      process.env = prevEnv
    })

    it('deletes the object using the key from audioUrl, then the files', async () => {
      const deleted: string[] = []
      const res = await deleteEpisode(paths, 'my-ep', {
        deleteAudio: true,
        deleteObject: async (key) => {
          // Must be read before the directory goes, or the key is unrecoverable.
          expect(fs.existsSync(path.join(paths.podcastDir, 'my-ep'))).toBe(true)
          deleted.push(key)
        },
      })
      expect(deleted).toEqual(['off-protocol/2026-07-10-my-ep/my-ep.mp3'])
      expect(res.audioDeleted).toBe(true)
      expect(res.audioKey).toBe('off-protocol/2026-07-10-my-ep/my-ep.mp3')
      expect(fs.existsSync(path.join(paths.podcastDir, 'my-ep'))).toBe(false)
    })

    it('leaves the episode in place when the object delete fails', async () => {
      await expect(
        deleteEpisode(paths, 'my-ep', {
          deleteAudio: true,
          deleteObject: async () => {
            throw new Error('AccessDenied')
          },
        }),
      ).rejects.toThrow(/off-protocol\/2026-07-10-my-ep\/my-ep\.mp3/)
      // Nothing removed, so the key is still recoverable and it can be retried.
      expect(fs.existsSync(path.join(paths.podcastDir, 'my-ep'))).toBe(true)
      expect(fs.readFileSync(paths.episodesFile, 'utf-8')).toContain("slug: 'my-ep'")
    })

    it('skips the object when the audio is hosted elsewhere', async () => {
      const ep = await readEpisode(paths, 'my-ep')
      await updateEpisode(paths, 'my-ep', {
        fields: { ...ep.fields, audioUrl: 'https://example.com/x.mp3' },
        body: 'Notes.',
      })
      let called = false
      const res = await deleteEpisode(paths, 'my-ep', {
        deleteAudio: true,
        deleteObject: async () => {
          called = true
        },
      })
      expect(called).toBe(false)
      expect(res.audioDeleted).toBe(false)
      expect(res.audioKey).toBeNull()
      expect(fs.existsSync(path.join(paths.podcastDir, 'my-ep'))).toBe(false)
    })

    it('never touches the object unless asked', async () => {
      let called = false
      const res = await deleteEpisode(paths, 'my-ep', {
        deleteObject: async () => {
          called = true
        },
      })
      expect(called).toBe(false)
      expect(res.audioDeleted).toBe(false)
      expect(res.dirRemoved).toBe(true)
    })
  })

  it('recomputes hasShowNotes on update from the body', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', { fields: ep.fields, body: 'Some real notes.' })
    expect((await readEpisode(paths, 'my-ep')).fields.hasShowNotes).toBe(true)
    await updateEpisode(paths, 'my-ep', { fields: ep.fields, body: '' })
    expect((await readEpisode(paths, 'my-ep')).fields.hasShowNotes).toBe(false)
  })

  it('setEpisodeAudio persists the audio fields to en.mdx and episodes.ts', async () => {
    const result = await setEpisodeAudio(paths, 'my-ep', {
      audioUrl: 'https://media.atproto.com/off-protocol/my-ep/my-ep.mp3',
      audioSizeBytes: 90_000_000,
      audioMimeType: 'audio/mpeg',
      duration: '01:02:03',
      durationSeconds: 3723,
    })
    expect(result.fields.audioSizeBytes).toBe(90_000_000)
    const mdx = fs.readFileSync(path.join(paths.podcastDir, 'my-ep', 'en.mdx'), 'utf-8')
    expect(mdx).toContain('audioSizeBytes: 90000000,')
    expect(mdx).toContain("duration: '01:02:03',")
    expect(mdx).toContain('durationSeconds: 3723,')
    const eps = fs.readFileSync(paths.episodesFile, 'utf-8')
    expect(eps).toContain('audioSizeBytes: 90000000,')
    expect(eps).toContain("duration: '01:02:03',")
  })

  it('setEpisodeAudio leaves the body and unmanaged header keys alone', async () => {
    const mdxPath = path.join(paths.podcastDir, 'my-ep', 'en.mdx')
    fs.writeFileSync(
      mdxPath,
      fs.readFileSync(mdxPath, 'utf-8').replace(
        'export const header = {\n',
        "export const header = {\n  coverImage: 'https://x/c.png',\n",
      ),
    )
    await setEpisodeAudio(paths, 'my-ep', {
      audioUrl: 'https://media.atproto.com/off-protocol/my-ep/new.mp3',
      audioSizeBytes: 42,
    })
    const mdx = fs.readFileSync(mdxPath, 'utf-8')
    expect(mdx).toContain("coverImage: 'https://x/c.png'")
    expect(mdx).toContain('Show notes.')
    expect(mdx).toContain("audioUrl: 'https://media.atproto.com/off-protocol/my-ep/new.mp3',")
  })

  it('keeps blueskyPostUrl through a round-trip, though no UI field owns it', async () => {
    // The editor dropped its Bluesky URL input; the value is set by hand in
    // en.mdx and must survive load → save, or episode pages silently lose their
    // discussion thread.
    const mdxPath = path.join(paths.podcastDir, 'my-ep', 'en.mdx')
    fs.writeFileSync(
      mdxPath,
      fs
        .readFileSync(mdxPath, 'utf-8')
        .replace(
          'export const header = {\n',
          "export const header = {\n  blueskyPostUrl: 'https://bsky.app/profile/did:plc:x/post/abc',\n",
        ),
    )
    const ep = await readEpisode(paths, 'my-ep')
    expect(ep.fields.blueskyPostUrl).toBe('https://bsky.app/profile/did:plc:x/post/abc')

    await updateEpisode(paths, 'my-ep', { fields: ep.fields, body: 'Notes.' })
    expect(fs.readFileSync(mdxPath, 'utf-8')).toContain(
      "blueskyPostUrl: 'https://bsky.app/profile/did:plc:x/post/abc'",
    )
    expect(fs.readFileSync(paths.episodesFile, 'utf-8')).toContain(
      "blueskyPostUrl: 'https://bsky.app/profile/did:plc:x/post/abc'",
    )
  })

  it('setEpisodeAudio rejects an unknown slug', async () => {
    await expect(
      setEpisodeAudio(paths, 'nope', { audioUrl: 'https://x/y.mp3', audioSizeBytes: 1 }),
    ).rejects.toThrow(/not found/i)
  })

  it('reads an episode whose header has a // comment (CLI/template style)', async () => {
    const mdxPath = path.join(paths.podcastDir, 'my-ep', 'en.mdx')
    const withComment = fs
      .readFileSync(mdxPath, 'utf-8')
      .replace(
        'export const header = {\n',
        "export const header = {\n  // Flip to true once you've written the notes\n",
      )
    fs.writeFileSync(mdxPath, withComment)
    const ep = await readEpisode(paths, 'my-ep')
    expect(ep.fields.title).toBe('My Episode')
  })
})

describe('episode author DIDs', () => {
  beforeEach(async () => {
    await createEpisode(paths, baseInput())
  })

  const authors = () =>
    JSON.parse(fs.readFileSync(paths.authorsFile, 'utf-8')) as Record<string, string>

  it('records a guest DID supplied at create time', async () => {
    await createEpisode(
      paths,
      baseInput({
        slug: 'with-guest',
        guests: ['Ethan Marcotte'],
        authorDids: { 'Ethan Marcotte': 'did:plc:ethan' },
      }),
    )
    expect(authors()['Ethan Marcotte']).toBe('did:plc:ethan')
  })

  // This is the case that bit us: the episode existed, the guest was added
  // afterwards, and the DID had to go into authors.json by hand.
  it('records a guest DID supplied while editing an existing episode', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', {
      fields: { ...ep.fields, guests: ['Ethan Marcotte'] },
      body: ep.body,
      revision: ep.revision,
      authorDids: { 'Ethan Marcotte': 'did:plc:ethan' },
    })
    expect(authors()['Ethan Marcotte']).toBe('did:plc:ethan')
  })

  it('leaves an already-known name alone', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', {
      fields: ep.fields,
      body: ep.body,
      revision: ep.revision,
      authorDids: { 'Jim Ray': 'did:plc:impostor' },
    })
    expect(authors()['Jim Ray']).toBe('did:plc:jim')
  })

  it('warns about a malformed DID but still saves the episode', async () => {
    const ep = await readEpisode(paths, 'my-ep')
    const res = await updateEpisode(paths, 'my-ep', {
      fields: { ...ep.fields, title: 'Renamed', guests: ['Typo Person'] },
      body: ep.body,
      revision: ep.revision,
      authorDids: { 'Typo Person': 'not-a-did' },
    })
    expect(res.warning).toMatch(/Typo Person/)
    expect(authors()['Typo Person']).toBeUndefined()
    expect((await readEpisode(paths, 'my-ep')).fields.title).toBe('Renamed')
  })

  it('does not touch authors.json when no DIDs are sent', async () => {
    const before = fs.readFileSync(paths.authorsFile, 'utf-8')
    const ep = await readEpisode(paths, 'my-ep')
    await updateEpisode(paths, 'my-ep', {
      fields: ep.fields,
      body: ep.body,
      revision: ep.revision,
    })
    expect(fs.readFileSync(paths.authorsFile, 'utf-8')).toBe(before)
  })
})

describe('setEpisodeAudio duration pairing', () => {
  beforeEach(async () => {
    await createEpisode(paths, baseInput())   // duration 00:10:00 / 600
  })

  const audio = { audioUrl: 'https://media/new.mp3', audioSizeBytes: 99 }

  it('writes both duration fields when both are measured', async () => {
    await setEpisodeAudio(paths, 'my-ep', {
      ...audio,
      duration: '00:20:00',
      durationSeconds: 1200,
    })
    const f = (await readEpisode(paths, 'my-ep')).fields
    expect(f.duration).toBe('00:20:00')
    expect(f.durationSeconds).toBe(1200)
  })

  // The browser resolves 0 when it can't read a file's metadata, which the
  // client formats as '00:00:00'. That string is truthy while 0 is not, so
  // guarding the two fields separately wrote a zero duration and kept the old
  // durationSeconds — the page showing 0:00 while the feed claimed 10 minutes.
  it('writes neither when the duration could not be measured', async () => {
    await setEpisodeAudio(paths, 'my-ep', {
      ...audio,
      duration: '00:00:00',
      durationSeconds: 0,
    })
    const f = (await readEpisode(paths, 'my-ep')).fields
    expect(f.duration).toBe('00:10:00')
    expect(f.durationSeconds).toBe(600)
  })

  it('writes neither when only one of the pair arrives', async () => {
    await setEpisodeAudio(paths, 'my-ep', { ...audio, duration: '00:20:00' })
    const f = (await readEpisode(paths, 'my-ep')).fields
    expect(f.duration).toBe('00:10:00')
    expect(f.durationSeconds).toBe(600)
  })

  it('still records the new url and size when the duration is unusable', async () => {
    await setEpisodeAudio(paths, 'my-ep', {
      ...audio,
      duration: '00:00:00',
      durationSeconds: 0,
    })
    const f = (await readEpisode(paths, 'my-ep')).fields
    expect(f.audioUrl).toBe('https://media/new.mp3')
    expect(f.audioSizeBytes).toBe(99)
  })
})
