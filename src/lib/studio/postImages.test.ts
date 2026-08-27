import { describe, it, expect } from 'vitest'
import {
  imageExtFor,
  sanitizeImageFilename,
  parsePreambleImports,
  identifierFor,
  addPreambleImport,
  imageTag,
} from './postImages'

describe('imageExtFor', () => {
  it('reads the extension from the filename', () => {
    expect(imageExtFor('chart.PNG', '')).toBe('png')
    expect(imageExtFor('photo.jpeg', '')).toBe('jpeg')
    expect(imageExtFor('anim.gif', '')).toBe('gif')
    expect(imageExtFor('shot.webp', '')).toBe('webp')
  })

  it('falls back to the MIME type when the name has no usable extension', () => {
    // A file dropped from some clipboards arrives as "image" with no extension.
    expect(imageExtFor('image', 'image/png')).toBe('png')
    expect(imageExtFor('screenshot', 'image/jpeg')).toBe('jpeg')
  })

  it('rejects types Next cannot import as a static image', () => {
    expect(imageExtFor('doc.pdf', 'application/pdf')).toBe(null)
    expect(imageExtFor('logo.svg', 'image/svg+xml')).toBe(null)
  })
})

describe('sanitizeImageFilename', () => {
  it('slugifies the basename and lowercases the extension', () => {
    expect(sanitizeImageFilename('My Chart.PNG')).toBe('my-chart.png')
  })

  it('drops punctuation that would need escaping in an import path', () => {
    expect(sanitizeImageFilename('pds chart (final).jpeg')).toBe('pds-chart-final.jpeg')
  })

  it('keeps only the final dot as the extension', () => {
    expect(sanitizeImageFilename('ep.12.final.png')).toBe('ep-12-final.png')
  })

  it('falls back to a usable name when the basename slugifies to nothing', () => {
    expect(sanitizeImageFilename('___.png')).toBe('image.png')
  })

  it('uses the resolved extension when the dropped name has none', () => {
    // Clipboard drops arrive as a bare "screenshot" with the type in the MIME.
    expect(sanitizeImageFilename('screenshot', 'jpeg')).toBe('screenshot.jpeg')
  })

  it('refuses to take over the post’s opengraph-image', () => {
    // Next reads opengraph-image.* from the post dir; an inline image landing
    // on that name would silently replace the post's social card.
    expect(sanitizeImageFilename('opengraph-image.png')).toBe('opengraph-image-2.png')
  })
})

describe('parsePreambleImports', () => {
  it('reads identifier and path from a default import', () => {
    expect(parsePreambleImports('import pdsesImg from "./pdses.png"\n\n')).toEqual([
      { identifier: 'pdsesImg', file: './pdses.png' },
    ])
  })

  it('reads single-quoted paths too', () => {
    expect(parsePreambleImports("import banner from './banner.png'\n")).toEqual([
      { identifier: 'banner', file: './banner.png' },
    ])
  })

  it('reads every import, in order', () => {
    const preamble = [
      'import banner from "./rpg-actor-banner.png"',
      'import dashboard from "./dashboard.png"',
      '',
      '',
    ].join('\n')
    expect(parsePreambleImports(preamble).map((i) => i.identifier)).toEqual([
      'banner',
      'dashboard',
    ])
  })

  it('ignores named and side-effect imports, which bind no default identifier', () => {
    const preamble = 'import { Chart } from "./chart"\nimport "./styles.css"\n'
    expect(parsePreambleImports(preamble)).toEqual([])
  })

  it('returns nothing for an empty preamble', () => {
    expect(parsePreambleImports('')).toEqual([])
  })
})

describe('identifierFor', () => {
  it('camelCases the basename', () => {
    expect(identifierFor('pds-chart.png', [])).toBe('pdsChart')
  })

  it('leaves a single-word name alone', () => {
    expect(identifierFor('banner.png', [])).toBe('banner')
  })

  it('prefixes a name that would start with a digit', () => {
    // `2026Chart` is not a legal identifier.
    expect(identifierFor('2026-chart.png', [])).toBe('img2026Chart')
  })

  it('suffixes a number when the name is already bound', () => {
    expect(identifierFor('chart.png', ['chart'])).toBe('chart2')
    expect(identifierFor('chart.png', ['chart', 'chart2'])).toBe('chart3')
  })

  it('avoids identifiers that would collide with the MDX header export', () => {
    expect(identifierFor('header.png', [])).toBe('headerImg')
  })

  it('avoids reserved words', () => {
    expect(identifierFor('class.png', [])).toBe('classImg')
  })

  it('falls back to a usable name when the basename yields no letters', () => {
    expect(identifierFor('___.png', [])).toBe('image')
  })
})

describe('addPreambleImport', () => {
  it('adds the import to an empty preamble, separated from the header', () => {
    // parseMdxFile splits at `export const header`, so the preamble must end
    // with the blank line that separates the two.
    expect(addPreambleImport('', 'pds-chart.png')).toEqual({
      preamble: 'import pdsChart from "./pds-chart.png"\n\n',
      identifier: 'pdsChart',
    })
  })

  it('appends after the last existing import', () => {
    const preamble = 'import banner from "./banner.png"\n\n'
    expect(addPreambleImport(preamble, 'dashboard.png')).toEqual({
      preamble:
        'import banner from "./banner.png"\nimport dashboard from "./dashboard.png"\n\n',
      identifier: 'dashboard',
    })
  })

  it('reuses the existing identifier when the file is already imported', () => {
    // Dropping a file with the same name replaces the bytes in place. A second
    // import line for the same path would not compile.
    const preamble = 'import banner from "./banner.png"\n\n'
    expect(addPreambleImport(preamble, 'banner.png')).toEqual({
      preamble,
      identifier: 'banner',
    })
  })

  it('picks a free identifier when the obvious one is taken', () => {
    const preamble = 'import chart from "./old-chart.png"\n\n'
    expect(addPreambleImport(preamble, 'chart.png').identifier).toBe('chart2')
  })

  it('keeps preamble content that is not an import', () => {
    const preamble = '/* hand-written note */\nimport banner from "./banner.png"\n\n'
    const { preamble: next } = addPreambleImport(preamble, 'chart.png')
    expect(next).toContain('/* hand-written note */')
    expect(next).toContain('import chart from "./chart.png"')
  })
})

describe('imageTag', () => {
  it('builds the tag the author pastes into the body', () => {
    expect(imageTag('pdsChart', 'A chart of PDS growth')).toBe(
      '<Image src={pdsChart} alt="A chart of PDS growth" />',
    )
  })

  it('escapes a double quote in the alt text', () => {
    // An unescaped quote closes the attribute and breaks the MDX parse.
    expect(imageTag('cover', 'the "big" one')).toBe(
      '<Image src={cover} alt="the &quot;big&quot; one" />',
    )
  })

  it('escapes an ampersand, which JSX reads as the start of an entity', () => {
    expect(imageTag('cover', 'this & that')).toBe(
      '<Image src={cover} alt="this &amp; that" />',
    )
  })

  it('still emits an alt attribute when no alt text was typed', () => {
    // alt="" is a deliberate "decorative"; a missing attribute is a lint error.
    expect(imageTag('cover', '')).toBe('<Image src={cover} alt="" />')
  })
})
