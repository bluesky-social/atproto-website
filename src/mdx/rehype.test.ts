import { compile } from '@mdx-js/mdx'
import { describe, expect, it } from 'vitest'
import { parseHighlightLines, rehypePlugins } from './rehype.mjs'
import { remarkPlugins } from './remark.mjs'

describe('parseHighlightLines', () => {
  it('parses single lines and ranges', () => {
    expect([...parseHighlightLines('{2,5-7}')]).toEqual([2, 5, 6, 7])
  })

  it('tolerates whitespace and surrounding meta', () => {
    expect([...parseHighlightLines('title {1, 3 - 4} other')]).toEqual([
      1, 3, 4,
    ])
  })

  it('returns an empty set without a range', () => {
    expect(parseHighlightLines(undefined).size).toBe(0)
    expect(parseHighlightLines('').size).toBe(0)
    expect(parseHighlightLines('{{ title: "x" }}').size).toBe(0)
  })
})

describe('rehypeShiki line highlighting', () => {
  async function render(src: string) {
    return String(
      await compile(src, { remarkPlugins, rehypePlugins, jsx: true }),
    )
  }

  it('marks only the requested lines', async () => {
    const out = await render('```ts {2}\nconst a = 1\nconst b = 2\n```\n')
    expect(out.match(/code-line-highlight/g)).toHaveLength(1)
    expect(out).toMatch(/code-line-highlight[^\n]*?b/)
  })

  it('leaves unmarked fences alone', async () => {
    const out = await render('```ts\nconst a = 1\n```\n')
    expect(out).not.toContain('code-line-highlight')
  })
})
