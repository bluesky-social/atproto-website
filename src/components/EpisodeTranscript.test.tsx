import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { EpisodeTranscript } from './EpisodeTranscript'

const Transcript = () => <p>**Jim Ray:** Hi.</p>

describe('EpisodeTranscript', () => {
  it('says the transcript was generated and may contain errors', () => {
    const html = renderToStaticMarkup(<EpisodeTranscript Transcript={Transcript} />)
    expect(html).toContain(
      'This transcript was generated automatically and may contain transcription errors.',
    )
  })

  it('puts the note before the transcript text', () => {
    const html = renderToStaticMarkup(<EpisodeTranscript Transcript={Transcript} />)
    const note = html.indexOf('generated automatically')
    expect(note).toBeGreaterThan(-1)
    expect(note).toBeLessThan(html.indexOf('Jim Ray'))
  })
})
