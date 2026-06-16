import { describe, expect, it } from 'vitest'
import { readShowNotesFlag } from './podcast-feed-content'

const header = (body: string) => `export const header = {
  episodeNumber: 1,
  title: 'X',
${body}
}

Show notes body.`

describe('readShowNotesFlag', () => {
  it('is true when the MDX header sets hasShowNotes: true', () => {
    expect(readShowNotesFlag(header('  hasShowNotes: true,'))).toBe(true)
  })

  it('is false when the MDX header sets hasShowNotes: false', () => {
    expect(readShowNotesFlag(header('  hasShowNotes: false,'))).toBe(false)
  })

  it('is false when the header omits the flag', () => {
    expect(readShowNotesFlag(header("  date: 'May 1, 2026',"))).toBe(false)
  })

  it('reads the header, not matching text in the notes body', () => {
    const mdx = `export const header = {
  hasShowNotes: false,
}

In this episode we discuss hasShowNotes: true and how feeds work.`
    expect(readShowNotesFlag(mdx)).toBe(false)
  })
})
