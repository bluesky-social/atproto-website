import { describe, it, expect } from 'vitest'
import { smartText } from './smartText'

describe('smartText', () => {
  it('curls double quotes', () => {
    expect(smartText('"Nothing Is Ever Over"')).toBe('“Nothing Is Ever Over”')
  })

  it('curls apostrophes', () => {
    expect(smartText("what's worth salvaging")).toBe('what’s worth salvaging')
  })

  it('converts dashes and ellipses the way prose does', () => {
    expect(smartText('a -- b')).toBe('a — b')
    expect(smartText('a --- b')).toBe('a – b')
    expect(smartText('wait...')).toBe('wait…')
  })

  it('is idempotent — already-smart text is unchanged', () => {
    // The studio round-trips: load, save, load. A second pass must not mangle.
    const smart = '“Nothing Is Ever Over” — it’s fine…'
    expect(smartText(smart)).toBe(smart)
  })

  it('leaves markdown syntax characters alone', () => {
    // This is why it must not round-trip through a markdown parser: remark
    // would escape these on stringify.
    const raw = '*star* _under_ #hash [x](y) `code` 100% a|b'
    expect(smartText(raw)).toBe(raw)
  })

  it('preserves non-ASCII text', () => {
    expect(smartText('日本語のタイトル')).toBe('日本語のタイトル')
  })

  it('handles empty and whitespace-only input', () => {
    expect(smartText('')).toBe('')
    expect(smartText('   ')).toBe('   ')
  })
})
