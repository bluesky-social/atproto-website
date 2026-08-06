import { describe, it, expect } from 'vitest'
import {
  DRAFT_SCHEMA,
  draftKey,
  serializeDraft,
  parseDraft,
  isDirty,
  describeDraft,
} from './draft'

const form = { title: 'The Shinkansen Mindset', body: 'notes', hosts: ['Jim Ray'] }

function envelope(over: Record<string, unknown> = {}) {
  return {
    v: DRAFT_SCHEMA,
    slug: '2026-08-06-shinkansen-mindset',
    mode: 'edit',
    savedAt: '2026-08-06T22:42:00.000Z',
    revision: 'abc123',
    form,
    ...over,
  }
}

describe('draftKey', () => {
  it('names a key per kind and slug', () => {
    expect(draftKey('podcast', '2026-08-06-shinkansen-mindset')).toBe(
      'studio:podcast:2026-08-06-shinkansen-mindset',
    )
  })

  // The new-document form has no slug of its own — the one typed into it is part
  // of the draft's contents, not its identity, since it changes as you type.
  it('names the new-document form', () => {
    expect(draftKey('podcast', '')).toBe('studio:podcast:new')
    expect(draftKey('blog', '')).toBe('studio:blog:new')
  })

  it('keeps blog and podcast apart for the same slug', () => {
    expect(draftKey('blog', 'cobblers-kids')).not.toBe(
      draftKey('podcast', 'cobblers-kids'),
    )
  })
})

describe('parseDraft', () => {
  it('round-trips a draft', () => {
    const parsed = parseDraft(serializeDraft(envelope()), {
      slug: '2026-08-06-shinkansen-mindset',
    })
    expect(parsed?.form).toEqual(form)
    expect(parsed?.revision).toBe('abc123')
    expect(parsed?.mode).toBe('edit')
  })

  it('returns null when there is no draft', () => {
    expect(parseDraft(null, { slug: 'x' })).toBeNull()
    expect(parseDraft('', { slug: 'x' })).toBeNull()
  })

  it('returns null for anything that is not a draft object', () => {
    expect(parseDraft('not json', { slug: 'x' })).toBeNull()
    expect(parseDraft('null', { slug: 'x' })).toBeNull()
    expect(parseDraft('[]', { slug: 'x' })).toBeNull()
    expect(parseDraft('"a string"', { slug: 'x' })).toBeNull()
    expect(parseDraft('42', { slug: 'x' })).toBeNull()
  })

  // The snapshot shape is the contract between what wrote the draft and what
  // reads it. A draft written by an older build of the studio is discarded rather
  // than applied to a form whose fields have moved on.
  it('returns null when the schema version does not match', () => {
    const stale = serializeDraft(envelope({ v: DRAFT_SCHEMA - 1 }))
    expect(parseDraft(stale, { slug: '2026-08-06-shinkansen-mindset' })).toBeNull()
  })

  // Belt to the URL validation's braces: a draft must never be applied to a
  // different document than the one it was captured from.
  it('returns null when the draft belongs to another document', () => {
    const raw = serializeDraft(envelope())
    expect(parseDraft(raw, { slug: 'cobblers-kids' })).toBeNull()
    expect(parseDraft(raw, { slug: '' })).toBeNull()
  })

  it('matches the new-document form on an empty slug', () => {
    const raw = serializeDraft(envelope({ slug: '', mode: 'new' }))
    expect(parseDraft(raw, { slug: '' })?.mode).toBe('new')
  })

  it('returns null for an unknown mode', () => {
    const raw = serializeDraft(envelope({ mode: 'browsing' }))
    expect(parseDraft(raw, { slug: '2026-08-06-shinkansen-mindset' })).toBeNull()
  })

  it('returns null when the form is not an object', () => {
    for (const bad of ['a string', 42, null, ['an array']]) {
      const raw = serializeDraft(envelope({ form: bad }))
      expect(
        parseDraft(raw, { slug: '2026-08-06-shinkansen-mindset' }),
      ).toBeNull()
    }
  })

  // An absent revision would restore as '', which the server reads as "no
  // precondition" — the draft would then overwrite a file that had changed on
  // disk instead of being refused. A draft we can't trust the revision of is not
  // a draft we can restore.
  it('returns null when the revision is missing or not a string', () => {
    for (const bad of [undefined, null, 7, {}]) {
      const raw = serializeDraft(envelope({ revision: bad }))
      expect(
        parseDraft(raw, { slug: '2026-08-06-shinkansen-mindset' }),
      ).toBeNull()
    }
  })

  // A new document has no file yet, so '' is its legitimate revision and has to
  // survive the round trip.
  it('keeps an empty revision for a new document', () => {
    const raw = serializeDraft(envelope({ slug: '', mode: 'new', revision: '' }))
    expect(parseDraft(raw, { slug: '' })?.revision).toBe('')
  })
})

describe('isDirty', () => {
  it('is false for identical snapshots', () => {
    expect(isDirty(form, { ...form, hosts: ['Jim Ray'] })).toBe(false)
  })

  it('is false for empty snapshots', () => {
    expect(isDirty({}, {})).toBe(false)
  })

  it('notices an edited string', () => {
    expect(isDirty(form, { ...form, title: 'The Shinkansen Mindsets' })).toBe(true)
  })

  // Guests and hosts are ordered — the byline prints them in order, so a reorder
  // is a real edit, not an equivalent snapshot.
  it('notices a reordered array', () => {
    expect(isDirty({ guests: ['a', 'b'] }, { guests: ['b', 'a'] })).toBe(true)
  })

  it('notices added and removed keys', () => {
    expect(isDirty({ a: 1 }, { a: 1, b: 2 })).toBe(true)
    expect(isDirty({ a: 1, b: 2 }, { a: 1 })).toBe(true)
  })

  // Trailing whitespace in the MDX body is an edit worth keeping: it survives to
  // the file, and losing it silently is the bug this whole thing exists to stop.
  it('notices a whitespace-only change', () => {
    expect(isDirty({ body: 'notes' }, { body: 'notes ' })).toBe(true)
    expect(isDirty({ body: 'a\nb' }, { body: 'a\n\nb' })).toBe(true)
  })

  it('notices a change nested in an object', () => {
    expect(
      isDirty({ fields: { n: 1, deep: { x: 'a' } } }, { fields: { n: 1, deep: { x: 'b' } } }),
    ).toBe(true)
  })

  // The episode-number input is type=number but round-trips through strings; a
  // loose comparison would call these equal and lose the edit.
  it('does not confuse a number with its string form', () => {
    expect(isDirty({ episodeNumber: 14 }, { episodeNumber: '14' })).toBe(true)
  })

  it('does not confuse null with undefined or with absent', () => {
    expect(isDirty({ a: null }, { a: undefined })).toBe(true)
    expect(isDirty({ a: null }, {})).toBe(true)
  })

  // Emptying the episode-number field can produce NaN. Reporting that as changed
  // is correct — the form no longer holds what the file does — and it keeps the
  // draft being written until the field is valid again.
  it('treats NaN as changed', () => {
    expect(isDirty({ episodeNumber: NaN }, { episodeNumber: NaN })).toBe(true)
  })
})

describe('describeDraft', () => {
  it('says when the draft was captured', () => {
    // Built from local parts so the expectation holds in any timezone.
    const savedAt = new Date(2026, 7, 6, 15, 42).toISOString()
    expect(describeDraft(envelope({ savedAt }))).toBe(
      'Restored unsaved changes from 3:42 PM',
    )
  })

  it('still says something when the timestamp is unusable', () => {
    expect(describeDraft(envelope({ savedAt: 'not a date' }))).toBe(
      'Restored unsaved changes',
    )
    expect(describeDraft(envelope({ savedAt: '' }))).toBe(
      'Restored unsaved changes',
    )
  })
})
