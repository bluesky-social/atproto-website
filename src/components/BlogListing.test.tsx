// These tests check server markup outside Next's mounted client router.
import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { posts } from '@/lib/posts'
import { blogTopics } from '@/lib/blogTags.mjs'
import { BlogListing } from './BlogListing'

vi.mock('@/components/TopicSelect/TopicSelectLoader', () => ({
  TopicSelectLoader: () => null,
}))

const render = (topic?: string) =>
  renderToStaticMarkup(<BlogListing topic={topic} />)

// Titles go through HTML escaping; compare against the escaped form.
const escaped = (text: string) => renderToStaticMarkup(<>{text}</>)

describe('BlogListing', () => {
  it('renders every post on the server when no topic is selected', () => {
    const html = render()
    for (const post of posts) expect(html).toContain(escaped(post.title))
  })

  it('renders only posts with the selected topic', () => {
    const html = render('feeds')
    const tagged = posts.filter((post) => post.tags?.includes('feeds'))
    const untagged = posts.filter((post) => !post.tags?.includes('feeds'))
    expect(tagged.length).toBeGreaterThan(0)
    for (const post of tagged) expect(html).toContain(escaped(post.title))
    for (const post of untagged) expect(html).not.toContain(escaped(post.title))
  })

  it('submits the topic selection to /blog/topic with GET', () => {
    const html = render()
    expect(html).toMatch(/<form[^>]*action="\/blog\/topic"/)
    expect(html).toMatch(/<form[^>]*method="get"/)
    expect(html).toMatch(/<select[^>]*name="topic"/)
  })

  it('offers "All topics" and one option per topic', () => {
    const values = [...render().matchAll(/<option value="([^"]*)"/g)].map(
      (m) => m[1],
    )
    expect(values).toEqual(['', ...blogTopics.map((t) => t.id)])
  })

  it('selects only the current topic', () => {
    const selected = [
      ...render('feeds').matchAll(/<option[^>]*selected[^>]*>/g),
    ]
    expect(selected).toHaveLength(1)
    expect(selected[0][0]).toContain('value="feeds"')
  })

  it('selects "All topics" when no topic is selected', () => {
    const selected = [...render().matchAll(/<option[^>]*selected[^>]*>/g)]
    expect(selected).toHaveLength(1)
    expect(selected[0][0]).toContain('value=""')
  })

  // Hiding it from JS flashes "Go" on every page load; CSS hides it at first
  // paint when scripting is on, and leaves it for no-JS readers.
  it('hides the submit button with CSS when scripting is enabled', () => {
    const button = render().match(/<button[^>]*type="submit"[^>]*>/)?.[0]
    expect(button).toContain('[@media(scripting:enabled)]:hidden')
  })

  it('wraps the form in the topic-select element for enhancement', () => {
    expect(render()).toMatch(/<topic-select>\s*<form/)
  })
})
