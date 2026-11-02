import { describe, it, expect } from 'vitest'
import { createSearch } from './blogSearch.mjs'
import {
  normalizeBlogTags,
  blogTopics,
  parseBlogQuery,
  formatBlogQuery,
  blogSearchHref,
} from './blogTags.mjs'

const page = (
  url: string,
  tags: string[] = [],
  title = 'OAuth',
  content = 'login',
) => ({
  url,
  tags,
  sections: [
    [title, null, [content]],
    ['Details', 'details', [title + ' ' + content]],
  ],
})
const search = createSearch([
  ...Array.from({ length: 12 }, (_, i) => page(`/guides/oauth-${i}`)),
  page('/blog/spaces', ['spaces', 'identity']),
  page('/blog/auth', ['identity']),
  page('/blog/other', ['sync'], 'Streaming', 'events'),
  page('/pt/blog/spaces', ['spaces', 'identity']),
])

describe('blog query and vocabulary', () => {
  it('combines OAuth with identity and removes format/catch-all topics', () => {
    expect(
      blogTopics.some((topic) =>
        ['oauth', 'tutorials', 'ecosystem'].includes(topic.id),
      ),
    ).toBe(false)
    expect(normalizeBlogTags(['identity', 'oauth', 'OAUTH'])).toEqual([
      'identity',
    ])
    expect(parseBlogQuery('tag:oauth tag:identity')).toEqual({
      text: '',
      tags: ['identity'],
    })
    expect(search('tag:oauth', { locale: 'en' })).toEqual(
      search('tag:identity', { locale: 'en' }),
    )
    for (const tag of ['tutorials', 'ecosystem'])
      expect(() => normalizeBlogTags([tag])).toThrow('Unknown blog tag')
    expect(normalizeBlogTags(['grants'])).toEqual(['grants'])
  })
  it('normalizes and deduplicates author input, rejects invalid data', () => {
    expect(normalizeBlogTags([' Spaces ', 'spaces', 'OAUTH'])).toEqual([
      'spaces',
      'identity',
    ])
    expect(normalizeBlogTags(undefined)).toEqual([])
    for (const invalid of [null, 'spaces', [1], ['made-up']]) {
      expect(() => normalizeBlogTags(invalid)).toThrow()
    }
  })
  it('parses multiple case-insensitive filters and preserves free text', () => {
    expect(
      parseBlogQuery('OAuth TAG:Spaces login tag:oauth tag:spaces'),
    ).toEqual({ text: 'OAuth login', tags: ['spaces', 'identity'] })
    expect(parseBlogQuery('tag:')).toEqual({ text: 'tag:', tags: [] })
    const query = formatBlogQuery('login', ['spaces', 'identity'])
    expect(parseBlogQuery(query)).toEqual({
      text: 'login',
      tags: ['spaces', 'identity'],
    })
    expect(
      new URL(blogSearchHref(query), 'https://atproto.com').searchParams.get(
        'q',
      ),
    ).toBe(query)
  })
})

describe('shared search engine', () => {
  it('retains documentation and section results without filters', () => {
    expect(search('oauth', { locale: 'en' })[0].isBlog).toBe(false)
    expect(
      search('oauth', { locale: 'en' }).some((r) => r.url.includes('#details')),
    ).toBe(true)
  })
  it('filters BEFORE applying a short result limit', () => {
    expect(
      search('oauth tag:spaces', { locale: 'en', limit: 1 }),
    ).toMatchObject([{ url: '/blog/spaces' }])
  })
  it('supports tag-only queries and intersects multiple tags', () => {
    expect(search('tag:spaces tag:oauth', { locale: 'en' })).toMatchObject([
      { url: '/blog/spaces' },
    ])
    expect(search('tag:spaces tag:sync')).toEqual([])
    expect(search('oauth tag:unknown')).toEqual([])
    expect(search('tag:unknown')).toEqual([])
  })
  it('deduplicates post sections for the blog listing', () => {
    expect(
      search('oauth', {
        blogsOnly: true,
        distinctPosts: true,
        locale: 'en',
      }).map((r) => r.url),
    ).toEqual(['/blog/spaces', '/blog/auth'])
  })
  it('applies locale restrictions to tag-only and text queries', () => {
    expect(search('tag:spaces', { locale: 'pt' }).map((r) => r.url)).toEqual([
      '/pt/blog/spaces',
    ])
    expect(
      search('oauth tag:spaces', { locale: 'pt', distinctPosts: true }).map(
        (r) => r.url,
      ),
    ).toEqual(['/pt/blog/spaces'])
    expect(search('tag:spaces', { locale: 'ja' }).map((r) => r.url)).toEqual([
      '/ja/blog/spaces',
    ])
  })
})
