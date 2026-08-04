import { describe, it, expect } from 'vitest'
import {
  fileRevision,
  assertRevision,
  RevisionConflictError,
} from './revision'

describe('fileRevision', () => {
  it('is stable for identical contents', () => {
    expect(fileRevision('one\ntwo\n')).toBe(fileRevision('one\ntwo\n'))
  })

  it('changes when the contents change', () => {
    expect(fileRevision('one\ntwo\n')).not.toBe(fileRevision('one\nTWO\n'))
  })

  it('notices a change as small as one character', () => {
    expect(fileRevision("pubDate: '2026-07-31'")).not.toBe(
      fileRevision("pubDate: '2026-08-31'"),
    )
  })
})

describe('assertRevision', () => {
  it('passes when the revision matches', () => {
    expect(() => assertRevision('abc', 'abc', 'Episode')).not.toThrow()
  })

  it('throws RevisionConflictError when the file moved on', () => {
    expect(() => assertRevision('abc', 'xyz', 'Episode')).toThrow(
      RevisionConflictError,
    )
  })

  it('names what conflicted so the editor can say something useful', () => {
    expect(() => assertRevision('abc', 'xyz', 'Episode')).toThrow(
      /Episode.*changed on disk/i,
    )
  })

  // The CLIs and the create flow have no revision to send, and requiring one
  // would break them. An absent revision means "no precondition" — the caller
  // keeps the old last-write-wins behaviour rather than being rejected.
  it('passes when no revision was supplied', () => {
    expect(() => assertRevision(undefined, 'xyz', 'Episode')).not.toThrow()
  })

  it('passes when the supplied revision is empty', () => {
    expect(() => assertRevision('', 'xyz', 'Episode')).not.toThrow()
  })
})
