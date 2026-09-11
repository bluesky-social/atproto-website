import { describe, expect, it } from 'vitest'
import { buildPodcastFeed, type FeedEpisode } from './podcast-feed'
import type { ShowMeta } from './episodes'

const show: ShowMeta = {
  title: 'Off Protocol',
  description: 'Show description.',
  author: 'Bluesky DevRel',
  defaultHost: 'Jim Ray',
  ownerEmail: 'hello@example.com',
  language: 'en-US',
  category: 'Technology',
  coverImage: 'https://media.example.com/cover.png',
  feedUrl: 'https://example.com/off-protocol/rss.xml',
  siteUrl: 'https://example.com/off-protocol',
  subscribe: { apple: null, spotify: null },
}

function makeEpisode(overrides: Partial<FeedEpisode> = {}): FeedEpisode {
  return {
    slug: 'my-slug',
    episodeNumber: 1,
    title: 'My Episode',
    description: 'A one sentence summary.',
    date: 'May 1, 2026',
    pubDate: '2026-05-01T12:00:00Z',
    duration: '00:10:00',
    durationSeconds: 600,
    // The feed deliberately doesn't render format — itunes:episodeType only
    // accepts full/trailer/bonus — but Episode requires one, so the fixture
    // has to supply it.
    format: 'conversation',
    audioUrl: 'https://media.example.com/ep.mp3',
    audioSizeBytes: 12345,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    contentHtml: '<p>A one sentence summary.</p>',
    ...overrides,
  }
}

// Pull the single <item> block out of a feed so channel-level elements
// (which share tag names like <description>) don't interfere.
function itemBlock(xml: string): string {
  const m = xml.match(/<item>[\s\S]*<\/item>/)
  if (!m) throw new Error('no <item> found in feed')
  return m[0]
}

// The item <description> is a plain (XML-escaped) summary, not CDATA.
function descriptionOf(block: string): string | null {
  const m = block.match(/<description>([\s\S]*?)<\/description>/)
  return m ? m[1] : null
}

// Read the CDATA payload of a given element inside a block.
function cdataOf(block: string, tag: string): string | null {
  const m = block.match(
    new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`),
  )
  return m ? m[1] : null
}

const PAGE_HREF = 'href="https://example.com/off-protocol/my-slug"'

describe('buildPodcastFeed — item <description>', () => {
  it('is the episode summary, never the show notes', () => {
    const xml = buildPodcastFeed(show, [
      makeEpisode({
        hasShowNotes: true,
        description: 'A one sentence summary.',
        contentHtml: '<h2>Links</h2><p>The full show notes.</p>',
      }),
    ])
    const desc = descriptionOf(itemBlock(xml))
    expect(desc).toContain('A one sentence summary.')
    expect(desc).not.toContain('<h2>Links</h2>')
    expect(desc).not.toContain('The full show notes.')
  })

  it('does not carry the link-back', () => {
    const xml = buildPodcastFeed(show, [makeEpisode({ hasShowNotes: true })])
    expect(descriptionOf(itemBlock(xml))).not.toContain(PAGE_HREF)
  })
})

describe('buildPodcastFeed — <content:encoded>', () => {
  it('contains the full show notes when the episode has them', () => {
    const xml = buildPodcastFeed(show, [
      makeEpisode({
        hasShowNotes: true,
        contentHtml: '<h2>Links</h2><p>The full show notes.</p>',
      }),
    ])
    const content = cdataOf(itemBlock(xml), 'content:encoded')
    expect(content).toContain('<h2>Links</h2>')
    expect(content).toContain('The full show notes.')
  })

  it('appends the link-back to the episode page', () => {
    const xml = buildPodcastFeed(show, [makeEpisode({ hasShowNotes: true })])
    const content = cdataOf(itemBlock(xml), 'content:encoded')
    expect(content).toContain(PAGE_HREF)
  })
})

// Channel-level elements only: everything before the first <item>. Items
// repeat tag names the channel also uses (itunes:image, description), so an
// item must never be able to satisfy a channel assertion.
function channelBlock(xml: string): string {
  const i = xml.indexOf('<item>')
  return i === -1 ? xml : xml.slice(0, i)
}

function ownerBlock(xml: string): string {
  const m = channelBlock(xml).match(/<itunes:owner>[\s\S]*?<\/itunes:owner>/)
  if (!m) throw new Error('no <itunes:owner> found in channel')
  return m[0]
}

// Both the channel byline and the owner name come from show.author — one
// field, two elements. The fixture's author, defaultHost, and ownerEmail are
// three distinct values so that wiring an element to the wrong one fails here.
describe('buildPodcastFeed — channel author and owner', () => {
  it('renders show.author as the channel <itunes:author>', () => {
    const xml = buildPodcastFeed(show, [makeEpisode()])
    expect(channelBlock(xml)).toContain(
      '<itunes:author>Bluesky DevRel</itunes:author>',
    )
  })

  it('renders show.author as the owner name, not the default host', () => {
    const owner = ownerBlock(buildPodcastFeed(show, [makeEpisode()]))
    expect(owner).toContain('<itunes:name>Bluesky DevRel</itunes:name>')
    expect(owner).not.toContain('Jim Ray')
  })

  it('keeps the owner email in its own element', () => {
    const owner = ownerBlock(buildPodcastFeed(show, [makeEpisode()]))
    expect(owner).toContain('<itunes:email>hello@example.com</itunes:email>')
  })
})
