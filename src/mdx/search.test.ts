import { describe, expect, it } from 'vitest'
import { extractSearchSections } from './search.mjs'

describe('extractSearchSections', () => {
  it('indexes markdown h2 headings as sections with slug anchors', () => {
    const sections = extractSearchSections(
      ['# Guide', '', 'Intro.', '', '## Getting started', '', 'Body.'].join(
        '\n',
      ),
    )
    expect(sections).toEqual([
      ['Guide', null, ['Intro.']],
      ['Getting started', 'getting-started', ['Body.']],
    ])
  })

  it('indexes inline <Heading level={2}> elements with their explicit id', () => {
    const sections = extractSearchSections(
      [
        '# アカウント移行',
        '',
        '概要です。',
        '',
        '<Heading level={2} id="migrating-data">データ移行</Heading>',
        '',
        '本文です。',
      ].join('\n'),
    )
    expect(sections).toEqual([
      ['アカウント移行', null, ['概要です。']],
      ['データ移行', 'migrating-data', ['本文です。']],
    ])
  })

  it('indexes multi-line <Heading level={2}> elements with their explicit id', () => {
    const sections = extractSearchSections(
      [
        '# Guide',
        '',
        '<Heading level={2} id="next-steps">',
        '  Next steps',
        '</Heading>',
        '',
        'Body.',
      ].join('\n'),
    )
    expect(sections).toEqual([
      ['Guide', null, []],
      ['Next steps', 'next-steps', ['Body.']],
    ])
  })

  it('leaves <Heading level={3}> elements in the surrounding section', () => {
    const sections = extractSearchSections(
      ['# Guide', '', '<Heading level={3} id="detail">Detail</Heading>'].join(
        '\n',
      ),
    )
    expect(sections).toEqual([['Guide', null, ['Detail']]])
  })
})
