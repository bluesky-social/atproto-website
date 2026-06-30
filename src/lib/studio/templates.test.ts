import { describe, it, expect } from 'vitest'
import { blogPageTsx } from './templates'

describe('blogPageTsx', () => {
  it('emits a Page component with escaped metadata', () => {
    const out = blogPageTsx({ title: "It's Here", description: 'Desc' })
    expect(out).toContain("import { Page } from '@/components/Page'")
    expect(out).toContain("title: 'It\\'s Here'")
    expect(out).toContain("description: 'Desc'")
    expect(out).toContain('export default async function BlogPost')
  })
})
