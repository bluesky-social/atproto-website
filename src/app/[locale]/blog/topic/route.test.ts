import { describe, expect, it } from 'vitest'
import { GET } from './route'

const get = (query: string) =>
  GET(new Request(`https://atproto.com/blog/topic${query}`))

// The no-JS path: the topic form submits here with GET.
describe('GET /blog/topic', () => {
  it('redirects a selected topic to its topic page', () => {
    const res = get('?topic=feeds')
    expect(res.status).toBe(303)
    expect(new URL(res.headers.get('location')!).pathname).toBe(
      '/blog/topic/feeds',
    )
  })

  it('redirects "All topics" to the full listing', () => {
    const res = get('?topic=')
    expect(new URL(res.headers.get('location')!).pathname).toBe('/blog')
  })

  it('redirects an unknown topic to the full listing', () => {
    const res = get('?topic=nope')
    expect(new URL(res.headers.get('location')!).pathname).toBe('/blog')
  })
})
