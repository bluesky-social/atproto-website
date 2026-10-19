import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { afterAll, describe, expect, it } from 'vitest'
import { extractSearchSections } from './search.mjs'

const dirs: string[] = []

// Writes an English page and its translation side by side, the way they live
// under src/app, and returns the translation's path.
function translation(en: string, translated: string, locale = 'ko'): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'heading-ids-'))
  dirs.push(dir)
  fs.writeFileSync(path.join(dir, 'en.mdx'), en)
  const file = path.join(dir, `${locale}.mdx`)
  fs.writeFileSync(file, translated)
  return file
}

function anchors(file: string): (string | null)[] {
  return extractSearchSections(fs.readFileSync(file, 'utf8'), file).map(
    ([, hash]: [string, string | null]) => hash,
  )
}

afterAll(() => {
  for (const dir of dirs) fs.rmSync(dir, { recursive: true, force: true })
})

const english = [
  '# Guide',
  '',
  '## Getting started',
  '',
  '## Migrating data',
  '',
  '## Next steps',
].join('\n')

describe('translated heading ids', () => {
  it('uses the English anchors when the headings line up', () => {
    const file = translation(
      english,
      [
        '# 가이드',
        '',
        '## 시작하기',
        '',
        '## 데이터 이전',
        '',
        '## 다음 단계',
      ].join('\n'),
    )
    expect(anchors(file)).toEqual([
      null,
      'getting-started',
      'migrating-data',
      'next-steps',
    ])
  })

  it('prefers an explicit id annotation', () => {
    const file = translation(
      english,
      [
        '# ガイド',
        '',
        '## はじめに',
        '',
        "## データ移行 {{ id: 'moving-data' }}",
        '',
        '## 次のステップ',
      ].join('\n'),
      'ja',
    )
    expect(anchors(file)).toEqual([
      null,
      'getting-started',
      'moving-data',
      'next-steps',
    ])
  })

  it('falls back without failing when the headings do not line up', () => {
    const file = translation(
      english,
      [
        '# 가이드',
        '',
        '## 시작하기',
        '',
        '## OAuth 설정',
        '',
        "## 데이터 이전 {{ id: 'migrating-data' }}",
        '',
        '## 다음 단계',
      ].join('\n'),
    )
    // Four sections against English's three, so positions can't be trusted.
    expect(anchors(file)).toEqual([
      null,
      'section-2-1',
      'o-auth',
      'migrating-data',
      'section-2-4',
    ])
  })

  it('leaves English pages slugified as usual', () => {
    const file = translation(english, english)
    const enFile = path.join(path.dirname(file), 'en.mdx')
    expect(anchors(enFile)).toEqual([
      null,
      'getting-started',
      'migrating-data',
      'next-steps',
    ])
  })
})
