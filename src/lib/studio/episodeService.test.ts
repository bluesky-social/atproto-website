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
  type CreateEpisodeInput,
} from './episodeService'
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
  paths = { podcastDir, episodesFile }
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
})
