import { describe, it, expect } from 'vitest'
import {
  quoteSingle,
  decodeStringLiteral,
  parseMdxFile,
  serializeMdxFile,
  getOwnedFields,
  applyOwnedFields,
  newPostMdx,
} from './mdxHeader'

const SAMPLE = `import banner from "./banner.png"

export const header = {
  standardSiteUri: 'at://did:plc:abc/site.standard.document/xyz',
  title: 'Old Title',
  description: 'A desc',
  date: 'June 1, 2026',
  author: 'Jim Ray',
}

## A heading

Body with <Custom prop="x" /> and more.
`

describe('quoteSingle', () => {
  it('wraps and escapes single quotes and backslashes', () => {
    expect(quoteSingle("It's a \\ test")).toBe("'It\\'s a \\\\ test'")
  })
})

describe('decodeStringLiteral', () => {
  it('decodes single-quoted with escapes', () => {
    expect(decodeStringLiteral("'It\\'s here'")).toBe("It's here")
  })
  it('decodes double-quoted', () => {
    expect(decodeStringLiteral('"hello"')).toBe('hello')
  })
})

describe('parse + serialize round-trip', () => {
  it('is byte-identical when nothing changes', () => {
    expect(serializeMdxFile(parseMdxFile(SAMPLE))).toBe(SAMPLE)
  })

  it('changes only the title line when title is updated', () => {
    const parsed = parseMdxFile(SAMPLE)
    const updated = applyOwnedFields(parsed, {
      ...getOwnedFields(parsed),
      title: 'New Title',
    })
    const out = serializeMdxFile(updated)
    expect(out).toBe(SAMPLE.replace("'Old Title'", "'New Title'"))
    // preamble, unknown field, and body all preserved
    expect(out).toContain('import banner from "./banner.png"')
    expect(out).toContain("standardSiteUri: 'at://did:plc:abc/site.standard.document/xyz'")
    expect(out).toContain('Body with <Custom prop="x" /> and more.')
  })

  it('exposes owned fields decoded', () => {
    expect(getOwnedFields(parseMdxFile(SAMPLE))).toEqual({
      title: 'Old Title',
      description: 'A desc',
      date: 'June 1, 2026',
      author: 'Jim Ray',
    })
  })

  it('throws when there is no header export', () => {
    expect(() => parseMdxFile('# just markdown\n')).toThrow(/header/i)
  })
})

describe('newPostMdx', () => {
  it('builds a canonical header with the owned fields in order, then the body', () => {
    const out = newPostMdx(
      { title: 'T', description: 'D', date: 'June 1, 2026', author: 'Jim Ray' },
      '# T\n\nStart writing your post here...\n',
    )
    expect(out).toBe(
      `export const header = {\n` +
        `  title: 'T',\n` +
        `  description: 'D',\n` +
        `  date: 'June 1, 2026',\n` +
        `  author: 'Jim Ray',\n` +
        `}\n\n# T\n\nStart writing your post here...\n`,
    )
  })
})
