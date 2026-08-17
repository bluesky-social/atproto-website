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

  // A raw newline inside a single-quoted literal is a syntax error, so a
  // multi-line value would emit an episodes.ts/posts.ts that cannot be parsed —
  // taking the whole build down.
  it('escapes newlines so the literal stays on one line', () => {
    expect(quoteSingle('first\nsecond')).toBe("'first\\nsecond'")
  })

  it('escapes carriage returns', () => {
    expect(quoteSingle('first\r\nsecond')).toBe("'first\\r\\nsecond'")
  })
})

describe('decodeStringLiteral', () => {
  it('decodes single-quoted with escapes', () => {
    expect(decodeStringLiteral("'It\\'s here'")).toBe("It's here")
  })
  it('decodes double-quoted', () => {
    expect(decodeStringLiteral('"hello"')).toBe('hello')
  })

  // Must understand every escape quoteSingle emits, or the pair loses data:
  // a naive "backslash takes the next char literally" turns \n into the letter n.
  it('decodes escaped newlines back to newlines', () => {
    expect(decodeStringLiteral("'first\\nsecond'")).toBe('first\nsecond')
  })

  it('round-trips a multi-line value through quoteSingle', () => {
    const value = 'first\nsecond\ttabbed'
    expect(decodeStringLiteral(quoteSingle(value))).toBe(value)
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
      blueskyPostUrl: '',
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
      blueskyPostUrl: '',
    })
  })
})

describe('newPostMdx', () => {
  it('builds a canonical header with the owned fields in order, then the body', () => {
    const out = newPostMdx(
      {
        title: 'T',
        description: 'D',
        date: 'June 1, 2026',
        author: 'Jim Ray',
        blueskyPostUrl: '',
      },
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

describe('blueskyPostUrl as an optional owned key', () => {
  const OWNED_WITH_URL = {
    title: 'A Post',
    description: 'About things',
    date: 'August 14, 2026',
    author: 'Jim Ray',
    blueskyPostUrl: 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d',
  }
  const OWNED_WITHOUT_URL = { ...OWNED_WITH_URL, blueskyPostUrl: '' }

  it('reads the field, and empty when the header has none', () => {
    const withIt = parseMdxFile(
      "export const header = {\n  blueskyPostUrl: 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d',\n}\n\nBody",
    )
    expect(getOwnedFields(withIt).blueskyPostUrl).toBe(
      'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d',
    )
    const withoutIt = parseMdxFile(
      "export const header = {\n  title: 'A Post',\n}\n\nBody",
    )
    expect(getOwnedFields(withoutIt).blueskyPostUrl).toBe('')
  })

  it('adds the line when a URL is set', () => {
    const parsed = parseMdxFile("export const header = {\n  title: 'Old',\n}\n\nBody")
    const out = serializeMdxFile(applyOwnedFields(parsed, OWNED_WITH_URL))
    expect(out).toContain(
      "blueskyPostUrl: 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d'",
    )
  })

  // Clearing the field must delete the entry, not leave blueskyPostUrl: ''. An
  // empty string in the header still reads as "there is a discussion" to anything
  // checking for the key's presence.
  it('removes the line when the field is cleared', () => {
    const parsed = parseMdxFile(
      "export const header = {\n  title: 'Old',\n  blueskyPostUrl: 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d',\n}\n\nBody",
    )
    const out = serializeMdxFile(applyOwnedFields(parsed, OWNED_WITHOUT_URL))
    expect(out).not.toContain('blueskyPostUrl')
  })

  // A whitespace-only value must be treated exactly like an empty string: the
  // header key is removed, not written as 'blueskyPostUrl: \'   \''. That value
  // would parse as truthy everywhere else in the pipeline (the publish script,
  // Page.tsx's nav gate) while failing bskyPostUrl.ts's own trimmed validation.
  it('removes the line when the field is whitespace-only', () => {
    const parsed = parseMdxFile(
      "export const header = {\n  title: 'Old',\n  blueskyPostUrl: 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d',\n}\n\nBody",
    )
    const out = serializeMdxFile(
      applyOwnedFields(parsed, { ...OWNED_WITH_URL, blueskyPostUrl: '   ' }),
    )
    expect(out).not.toContain('blueskyPostUrl')
  })

  it('never writes an empty value for it', () => {
    const parsed = parseMdxFile("export const header = {\n  title: 'Old',\n}\n\nBody")
    const out = serializeMdxFile(applyOwnedFields(parsed, OWNED_WITHOUT_URL))
    expect(out).not.toContain("blueskyPostUrl: ''")
  })

  it('still preserves non-owned fields either way', () => {
    const parsed = parseMdxFile(
      "export const header = {\n  standardSiteUri: 'at://x',\n  title: 'Old',\n}\n\nBody",
    )
    expect(serializeMdxFile(applyOwnedFields(parsed, OWNED_WITH_URL))).toContain(
      "standardSiteUri: 'at://x'",
    )
    expect(serializeMdxFile(applyOwnedFields(parsed, OWNED_WITHOUT_URL))).toContain(
      "standardSiteUri: 'at://x'",
    )
  })

  it('omits it from a new post, and includes it when given', () => {
    expect(newPostMdx(OWNED_WITHOUT_URL, 'Body')).not.toContain('blueskyPostUrl')
    expect(newPostMdx(OWNED_WITH_URL, 'Body')).toContain(
      "blueskyPostUrl: 'https://bsky.app/profile/atproto.com/post/3msydg6sd7s2d'",
    )
  })
})

describe('comment-aware header parsing', () => {
  it('skips // line comments (even with apostrophes) in the header', () => {
    const sample =
      'export const header = {\n' +
      "  title: 'X',\n" +
      "  // Flip to true once you've written the show notes / transcript below.\n" +
      '  hasShowNotes: false,\n' +
      '}\n\nbody\n'
    const parsed = parseMdxFile(sample)
    expect(parsed.headerEntries.map((e) => e.key)).toEqual(['title', 'hasShowNotes'])
  })

  it('skips /* block comments */ in the header', () => {
    const sample =
      'export const header = {\n' +
      "  title: 'X', /* note: don't break */\n" +
      '  n: 1,\n' +
      '}\n\nbody\n'
    const parsed = parseMdxFile(sample)
    expect(parsed.headerEntries.map((e) => e.key)).toEqual(['title', 'n'])
  })
})
