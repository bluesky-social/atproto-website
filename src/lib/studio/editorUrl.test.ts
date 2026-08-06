import { describe, it, expect } from 'vitest'
import { isEditableSlug, slugFromSearch, searchWithSlug } from './editorUrl'

describe('isEditableSlug', () => {
  it('accepts the slugs the studio actually produces', () => {
    expect(isEditableSlug('2026-08-06-shinkansen-mindset')).toBe(true)
    expect(isEditableSlug('cobblers-kids')).toBe(true)
    expect(isEditableSlug('2024-protocol-roadmap')).toBe(true)
  })

  it('rejects an empty or missing slug', () => {
    expect(isEditableSlug('')).toBe(false)
    expect(isEditableSlug(null)).toBe(false)
    expect(isEditableSlug(undefined)).toBe(false)
  })

  // The slug reaches the server as a path segment and is joined onto the
  // content directory there without further checks, so a slug arriving from the
  // query string is validated before it is ever fetched.
  it('rejects path traversal and separators', () => {
    expect(isEditableSlug('../../../etc/passwd')).toBe(false)
    expect(isEditableSlug('..')).toBe(false)
    expect(isEditableSlug('a/b')).toBe(false)
    expect(isEditableSlug('a\\b')).toBe(false)
  })

  // `src/app/[locale]/off-protocol/` holds layout.tsx and page.tsx alongside the
  // episode directories; neither is an episode.
  it('rejects file names', () => {
    expect(isEditableSlug('page.tsx')).toBe(false)
    expect(isEditableSlug('layout.tsx')).toBe(false)
  })

  it('rejects anything slugify would not have made', () => {
    expect(isEditableSlug('Cobblers-Kids')).toBe(false)
    expect(isEditableSlug('two words')).toBe(false)
    expect(isEditableSlug('-leading-hyphen')).toBe(false)
    expect(isEditableSlug('emoji-🎧')).toBe(false)
  })
})

describe('slugFromSearch', () => {
  it('reads the slug the editor was opened with', () => {
    expect(slugFromSearch('?slug=cobblers-kids')).toBe('cobblers-kids')
  })

  it('works with or without the leading question mark', () => {
    expect(slugFromSearch('slug=cobblers-kids')).toBe('cobblers-kids')
  })

  it('returns empty for no query string at all', () => {
    expect(slugFromSearch('')).toBe('')
    expect(slugFromSearch('?')).toBe('')
  })

  it('returns empty when there is no slug param', () => {
    expect(slugFromSearch('?tab=audio')).toBe('')
  })

  it('finds the slug among other params', () => {
    expect(slugFromSearch('?tab=audio&slug=in-our-timeline')).toBe(
      'in-our-timeline',
    )
  })

  // A hand-edited or stale URL must land on the new-episode form rather than
  // firing a fetch that 404s, or worse, escapes the content directory.
  it('returns empty for a slug that is not editable', () => {
    expect(slugFromSearch('?slug=')).toBe('')
    expect(slugFromSearch('?slug=../../secrets')).toBe('')
    expect(slugFromSearch('?slug=%2E%2E%2Fsecrets')).toBe('')
    expect(slugFromSearch('?slug=Not A Slug')).toBe('')
  })
})

describe('searchWithSlug', () => {
  it('adds the slug to an empty query string', () => {
    expect(searchWithSlug('', 'cobblers-kids')).toBe('?slug=cobblers-kids')
  })

  it('replaces a slug that is already there', () => {
    expect(searchWithSlug('?slug=in-our-timeline', 'cobblers-kids')).toBe(
      '?slug=cobblers-kids',
    )
  })

  it('preserves other params', () => {
    expect(searchWithSlug('?tab=audio', 'cobblers-kids')).toBe(
      '?tab=audio&slug=cobblers-kids',
    )
  })

  // Starting a new episode has nothing to point at yet, so the param goes away
  // instead of lingering and pointing at the episode that was just left.
  it('drops the slug when there is none', () => {
    expect(searchWithSlug('?slug=cobblers-kids', '')).toBe('')
    expect(searchWithSlug('?tab=audio&slug=cobblers-kids', '')).toBe('?tab=audio')
  })

  it('refuses to write a slug it would not read back', () => {
    expect(searchWithSlug('', '../escape')).toBe('')
  })

  // history.replaceState is called with this on every load, so a no-op has to
  // stay a no-op rather than accumulating history entries or churning the URL.
  it('is idempotent', () => {
    const once = searchWithSlug('', 'cobblers-kids')
    expect(searchWithSlug(once, 'cobblers-kids')).toBe(once)
  })
})
