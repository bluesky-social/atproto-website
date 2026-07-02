import { describe, it, expect } from 'vitest'
import {
  quoteSingle,
  decodeStringLiteral,
  parseMdxFile,
  serializeMdxFile,
  getOwnedFields,
  getHeaderField,
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

describe('string-scan escape parity', () => {
  it('treats a value ending in an escaped backslash as closed (does not eat later fields)', () => {
    const sample =
      'export const header = {\n' +
      "  winpath: 'ends with a backslash\\\\',\n" +
      "  title: 'After',\n" +
      '}\n\nbody\n'
    const parsed = parseMdxFile(sample)
    expect(parsed.headerEntries.map((e) => e.key)).toEqual(['winpath', 'title'])
    expect(parsed.headerEntries[1].rawValue).toBe("'After'")
    expect(serializeMdxFile(parsed)).toBe(sample) // byte-identical round-trip
  })
})

describe('getOwnedFields with missing keys', () => {
  it('returns empty strings for owned fields absent from the header', () => {
    const sample = "export const header = {\n  title: 'Only Title',\n}\n\nbody\n"
    expect(getOwnedFields(parseMdxFile(sample))).toEqual({
      title: 'Only Title',
      description: '',
      date: '',
      author: '',
    })
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

describe('getHeaderField', () => {
  it('returns a non-owned field decoded, and empty string when absent', () => {
    const parsed = parseMdxFile(SAMPLE)
    expect(getHeaderField(parsed, 'standardSiteUri')).toBe(
      'at://did:plc:abc/site.standard.document/xyz',
    )
    expect(getHeaderField(parsed, 'nope')).toBe('')
  })
})
