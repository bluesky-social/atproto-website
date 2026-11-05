import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Page } from './Page'

// SubpageLinks reads the pathname; outside the App Router there is none.
vi.mock('next/navigation', () => ({ usePathname: () => '/blog/example' }))

const Body = () => <p>POST BODY</p>

describe('Page topic links', () => {
  it('places topic links after the post body, not in the header', () => {
    const html = renderToStaticMarkup(
      <Page default={Body} header={{ title: 'Example', tags: ['sync'] }} />,
    )
    const firstTopicLink = html.indexOf('href="/blog/topic/sync"')
    expect(firstTopicLink).toBeGreaterThan(-1)
    expect(firstTopicLink).toBeGreaterThan(html.indexOf('POST BODY'))
  })

  it('renders no topic block when the page has no tags', () => {
    const html = renderToStaticMarkup(
      <Page default={Body} header={{ title: 'Example' }} />,
    )
    expect(html).not.toContain('/blog/topic/')
    expect(html).not.toContain('aria-label="Topics"')
  })
})
