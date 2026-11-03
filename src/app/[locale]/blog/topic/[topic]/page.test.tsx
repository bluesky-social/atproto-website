import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import TopicPage, { generateMetadata } from './page'

const params = (topic: string) => ({ params: Promise.resolve({ topic }) })

describe('blog topic page', () => {
  it('renders the topic label as the page subject', async () => {
    const html = renderToStaticMarkup(await TopicPage(params('sync')))
    expect(html).toContain('Network Data')
  })

  it('returns a 404 for an unknown topic', async () => {
    await expect(TopicPage(params('not-a-topic'))).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    })
  })

  it('titles the page with the topic label', async () => {
    const metadata = await generateMetadata(params('feeds'))
    expect(metadata.title).toContain('Feeds')
  })
})
