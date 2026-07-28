import { describe, it, expect } from 'vitest'
import { resolveLocaleMdx, mdxRouteMetadata } from './localizedMdx'

const en = { header: { title: 'English', description: 'En desc' } }
const ja = { header: { title: '日本語', description: 'Ja desc' } }

describe('resolveLocaleMdx', () => {
  it('short-circuits for English without invoking the loader', async () => {
    let called = false
    const out = await resolveLocaleMdx(Promise.resolve({ locale: 'en' }), en, async () => {
      called = true
      return ja
    })
    expect(out).toBe(en)
    expect(called).toBe(false)
  })

  it('loads the requested locale', async () => {
    const seen: string[] = []
    const out = await resolveLocaleMdx(Promise.resolve({ locale: 'ja' }), en, async (l) => {
      seen.push(l)
      return ja
    })
    expect(seen).toEqual(['ja'])
    expect(out).toBe(ja)
  })

  it('falls back to English when the translation is missing', async () => {
    // Not every page is translated into every language; a missing file must
    // render English rather than 500.
    const out = await resolveLocaleMdx(Promise.resolve({ locale: 'pt' }), en, async () => {
      throw new Error('ENOENT')
    })
    expect(out).toBe(en)
  })

  it('falls back when no locale is present at all', async () => {
    let called = false
    const out = await resolveLocaleMdx(Promise.resolve({}), en, async () => {
      called = true
      return ja
    })
    expect(out).toBe(en)
    expect(called).toBe(false)
  })
})

describe('mdxRouteMetadata', () => {
  it('reads the header export', () => {
    expect(mdxRouteMetadata(ja)).toEqual({ title: '日本語', description: 'Ja desc' })
  })

  it('falls back to the older metadata export', () => {
    // Two pages predate the header convention — see mdx.d.ts.
    const mod = { metadata: { title: 'Data Validation', description: 'Limits' } }
    expect(mdxRouteMetadata(mod)).toEqual({
      title: 'Data Validation',
      description: 'Limits',
    })
  })

  it('prefers header when a file carries both', () => {
    const mod = {
      header: { title: 'From header', description: 'H' },
      metadata: { title: 'From metadata', description: 'M' },
    }
    expect(mdxRouteMetadata(mod)).toEqual({ title: 'From header', description: 'H' })
  })

  it('returns undefined fields rather than throwing when neither exists', () => {
    expect(mdxRouteMetadata({})).toEqual({ title: undefined, description: undefined })
  })
})
