import { describe, it, expect } from 'vitest'
import { singleLine } from './text'

describe('singleLine', () => {
  it('replaces a newline with a space', () => {
    expect(singleLine('first\nsecond')).toBe('first second')
  })

  it('treats CRLF as one break, not two', () => {
    expect(singleLine('first\r\nsecond')).toBe('first second')
  })

  it('collapses a blank line into one space', () => {
    expect(singleLine('first\n\n\nsecond')).toBe('first second')
  })

  it('absorbs indentation that follows a break', () => {
    expect(singleLine('first\n    second')).toBe('first second')
  })

  it('leaves a value with no breaks untouched', () => {
    expect(singleLine('already one line')).toBe('already one line')
  })

  // The editors call this on every keystroke. Trimming would delete the space
  // the moment it is typed — exactly the bug the guests field had, where the
  // value was re-derived and trimmed before the next character arrived.
  it('preserves a trailing space so it can still be typed', () => {
    expect(singleLine('typing ')).toBe('typing ')
  })

  it('preserves a leading space rather than trimming', () => {
    expect(singleLine(' leading')).toBe(' leading')
  })
})
