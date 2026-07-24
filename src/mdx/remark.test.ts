import { remark } from 'remark'
import { describe, expect, it } from 'vitest'
import {
  remarkPlugins,
  remarkSmartTypographyScoped,
  SMART_TYPOGRAPHY_OPTIONS,
} from './remark.mjs'

// Run markdown through the scoped plugin with a faked VFile path.
async function render(src: string, path: string): Promise<string> {
  const file = await remark()
    .use(remarkSmartTypographyScoped, SMART_TYPOGRAPHY_OPTIONS)
    .process({ path, value: src })
  return String(file).trim()
}

describe('remarkSmartTypographyScoped', () => {
  it('transforms quotes, dashes, and ellipses in blog MDX', async () => {
    const out = await render(
      `She said "hi" -- really --- ok... it's fine`,
      '/s/app/en/blog/my-post/en.mdx',
    )
    expect(out).toBe('She said “hi” — really – ok… it’s fine')
  })

  it('transforms podcast transcript MDX', async () => {
    const out = await render(`"Quoted"`, '/s/app/en/off-protocol/ep/transcript.mdx')
    expect(out).toBe('“Quoted”')
  })

  it('leaves inline code untouched while transforming surrounding prose', async () => {
    const out = await render(
      'prose "x" -- y `keep "z" -- w`',
      '/s/app/en/blog/my-post/en.mdx',
    )
    expect(out).toBe('prose “x” — y `keep "z" -- w`')
  })

  it('does NOT transform docs MDX', async () => {
    const out = await render(`She said "hi" -- ok...`, '/s/app/en/docs/guide.mdx')
    expect(out).toBe('She said "hi" -- ok...')
  })
})

describe('remarkPlugins wiring', () => {
  it('includes the scoped smart-typography plugin as the last entry', () => {
    const last = remarkPlugins[remarkPlugins.length - 1]
    expect(Array.isArray(last)).toBe(true)
    expect(last[0]).toBe(remarkSmartTypographyScoped)
    expect(last[1]).toEqual(SMART_TYPOGRAPHY_OPTIONS)
    expect(last[1].dashes).toBe('inverted')
  })
})
