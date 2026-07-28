import { describe, it, expect } from 'vitest'
import { blogPageTsx } from './templates'

describe('blogPageTsx', () => {
  it('derives metadata from the MDX header instead of duplicating it', () => {
    const out = blogPageTsx()
    expect(out).toContain("import { Page } from '@/components/Page'")
    expect(out).toContain("import * as content from './en.mdx'")
    expect(out).toContain('export function generateMetadata()')
    expect(out).toContain('content.header.title')
    expect(out).toContain('content.header.description')
    expect(out).toContain('export default function BlogPost')
  })

  it('emits no metadata object and no dynamic import', () => {
    // The duplicated object was the thing that drifted from the header, and the
    // template-literal import was what defeated hot reload.
    const out = blogPageTsx()
    expect(out).not.toContain('export const metadata')
    expect(out).not.toContain('${')
  })
})
