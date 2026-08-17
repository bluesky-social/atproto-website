/**
 * Unsaved-work drafts for the studio editors.
 *
 * Both editors hold the document being written in component state, so anything
 * that reloads the tab loses it. Putting the slug in the URL (see ./editorUrl)
 * brings the right document back; this brings the *text* back with it.
 *
 * **sessionStorage, deliberately, not localStorage.** The failure being recovered
 * from is "this tab reloaded" — the dev server issues full reloads for reasons
 * that have nothing to do with the studio — and per-tab-surviving-reload is
 * exactly sessionStorage's lifetime. localStorage is worse twice over: it is
 * shared between tabs, so two studio tabs would collide on the `new` key and one
 * tab's save would wipe the other's draft; and its drafts outlive the work, so
 * you would eventually be offered a draft written before commits made since. The
 * cost is that closing the tab drops the draft, which is the right trade —
 * closing a tab is something you meant to do.
 *
 * A draft is only written when the form differs from what it was loaded from, so
 * "unsaved changes" always means there were some.
 *
 * MUST STAY FREE OF NODE BUILT-INS. The editors are `'use client'` components, so
 * everything reachable from here ends up in the browser bundle.
 */

/**
 * The snapshot shape is a contract between the build that wrote a draft and the
 * build that reads it. Bump this whenever an editor's snapshot gains, loses, or
 * renames a field; older drafts are then discarded instead of being applied to a
 * form that no longer matches them.
 *
 * v2 (2026-08-14): the blog snapshot's `owned` gained blueskyPostUrl.
 */
export const DRAFT_SCHEMA = 2

export type Draft<T = unknown> = {
  v: number
  /** The document this draft belongs to; '' for the new-document form. */
  slug: string
  mode: 'new' | 'edit'
  savedAt: string
  /**
   * The revision the form was loaded with, carried so a restored draft still
   * conflicts with a file that changed on disk rather than overwriting it.
   */
  revision: string
  form: T
}

/**
 * Where a document's draft lives.
 *
 * The new-document form keys off '' rather than the slug typed into it: that slug
 * is part of the draft's contents and changes as you type, so it can't also be
 * its identity.
 */
export function draftKey(kind: 'podcast' | 'blog', slug: string): string {
  return `studio:${kind}:${slug || 'new'}`
}

export function serializeDraft(draft: unknown): string {
  return JSON.stringify(draft)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * A usable draft for `slug`, or null.
 *
 * Every rejection is a null rather than a throw: a draft is a convenience, and a
 * corrupt or stale one must degrade to "no draft" instead of taking the editor
 * down with it.
 */
export function parseDraft(
  raw: string | null | undefined,
  expected: { slug: string },
): Draft | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null

  if (parsed.v !== DRAFT_SCHEMA) return null
  if (parsed.slug !== expected.slug) return null
  if (parsed.mode !== 'new' && parsed.mode !== 'edit') return null
  // An absent revision restores as '', which the server reads as "no
  // precondition" — the draft would then overwrite a file that had changed
  // underneath it instead of being refused. Don't restore what we can't trust
  // the revision of.
  if (typeof parsed.revision !== 'string') return null
  if (typeof parsed.savedAt !== 'string') return null
  if (!isRecord(parsed.form)) return null

  return {
    v: parsed.v,
    slug: parsed.slug,
    mode: parsed.mode,
    savedAt: parsed.savedAt,
    revision: parsed.revision,
    form: parsed.form,
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]))
  }
  if (isRecord(a) && isRecord(b)) {
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    return keys.every(
      (k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]),
    )
  }
  return false
}

/**
 * Whether a form snapshot differs from the one it was loaded from.
 *
 * Structural and strict: `14` is not `'14'`, a reordered guest list is a change,
 * and so is trailing whitespace in the MDX body. Anything this misses is work
 * that gets silently dropped, which is the failure being fixed — so it errs
 * toward reporting a change (NaN, for one, is never equal to itself).
 */
export function isDirty(current: unknown, baseline: unknown): boolean {
  return !deepEqual(current, baseline)
}

/**
 * The status-line message for a restored draft.
 *
 * Explicit 'en-US' rather than the ambient locale, matching todayLong() in the
 * blog editor, so the studio reads the same wherever it runs.
 */
export function describeDraft(draft: { savedAt: string }): string {
  const when = new Date(draft.savedAt)
  if (!draft.savedAt || Number.isNaN(when.getTime())) {
    return 'Restored unsaved changes'
  }
  const time = when.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `Restored unsaved changes from ${time}`
}

// --- The only part that touches the browser. -------------------------------
// Kept to three thin wrappers so the logic above stays testable in the node
// environment. sessionStorage throws when it's disabled or over quota; a draft is
// a convenience, so every failure degrades to "no drafts" rather than surfacing.

export function readDraft(key: string, slug: string): Draft | null {
  try {
    return parseDraft(window.sessionStorage.getItem(key), { slug })
  } catch {
    return null
  }
}

export function writeDraft(key: string, draft: Draft): void {
  try {
    window.sessionStorage.setItem(key, serializeDraft(draft))
  } catch {
    // Disabled or full — the editor works as it did before drafts existed.
  }
}

export function clearDraft(key: string): void {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // As above.
  }
}
