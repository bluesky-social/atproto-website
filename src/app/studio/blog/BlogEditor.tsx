'use client'

import { useEffect, useRef, useState } from 'react'
// Pure module, and a type-only import that TypeScript erases: this is a client
// component, so nothing reaching node:child_process may be imported here.
import { branchNameFor } from '@/lib/gitNames.mjs'
import { singleLine } from '@/lib/studio/text'
import { slugFromSearch, searchWithSlug } from '@/lib/studio/editorUrl'
import {
  DRAFT_SCHEMA,
  draftKey,
  readDraft,
  writeDraft,
  clearDraft,
  isDirty,
  describeDraft,
} from '@/lib/studio/draft'
import { unknownAuthors, isValidDid, type AuthorMap } from '@/lib/studio/authors'
import type { GitState } from '@/lib/studio/git'
import { isBskyPostUrl } from '@/lib/bskyPostUrl'
import { guardUnload } from '@/lib/studio/unloadGuard'
import { StudioNav } from '../StudioNav'

type PostListItem = { slug: string; title: string; date: string }
type Owned = {
  title: string
  description: string
  date: string
  author: string
  blueskyPostUrl: string
}
type Publish = { ok: boolean; uri?: string; error?: string }

const EMPTY: Owned = {
  title: '',
  description: '',
  date: '',
  author: '',
  blueskyPostUrl: '',
}

/**
 * Everything a reload would otherwise lose. Stored as a draft and compared
 * against what was loaded from disk to tell whether there is anything to keep.
 *
 * Excludes what the server owns and the mount refetches — the post list, git
 * state, authors.json, the OG image, the standard.site URI — and `status`, which
 * describes the last action rather than the document.
 *
 * Bump DRAFT_SCHEMA in @/lib/studio/draft when this shape changes.
 */
type Snapshot = {
  mode: 'new' | 'edit'
  slug: string
  owned: Owned
  body: string
  authorDids: Record<string, string>
}

function todayLong(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Point the address bar at the post this tab has open.
 *
 * Everything in this form lives in component state, so a reload — including the
 * full reloads the dev server issues for reasons unrelated to this tab — used to
 * lose it and drop back to the new-post form, where the next Save creates a post
 * rather than updating the one being edited. Same fix, same reasoning, as the
 * episode editor; see the note on syncUrl there.
 */
function syncUrl(slug: string) {
  const search = searchWithSlug(window.location.search, slug)
  window.history.replaceState(null, '', window.location.pathname + search)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function BlogEditor() {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [mode, setMode] = useState<'new' | 'edit'>('new')
  const [slug, setSlug] = useState('')
  const [owned, setOwned] = useState<Owned>({ ...EMPTY, date: todayLong() })
  // authors.json, so the form can say when the author has no DID yet. Refreshed
  // by refreshList() on mount and after every save.
  const [knownAuthors, setKnownAuthors] = useState<AuthorMap>({})
  // Name → DID typed into the prompt below. Not post data — it lands in
  // authors.json, and a map keeps the shape identical to the episode editor's.
  const [authorDids, setAuthorDids] = useState<Record<string, string>>({})
  const [body, setBody] = useState('')
  const [ssiteUri, setSsiteUri] = useState('')
  const [ogImage, setOgImage] = useState<string | null>(null)
  const [ogVersion, setOgVersion] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<string>('')
  // Fingerprint of the file this form was loaded from. Sent with every save so
  // the server can refuse to overwrite changes made since. Empty means "no
  // precondition" — a new post has no file yet.
  const [revision, setRevision] = useState('')
  const [conflict, setConflict] = useState(false)
  const [copied, setCopied] = useState(false)
  const [git, setGit] = useState<GitState | null>(null)
  const [makeBranch, setMakeBranch] = useState(true)
  const [branchName, setBranchName] = useState('')
  const [dirtyFiles, setDirtyFiles] = useState<string[]>([])
  // The form as it was last loaded from disk or written to it. A draft is only
  // kept while the form differs from this, so "unsaved changes" is never a lie.
  const [baseline, setBaseline] = useState<Snapshot | null>(null)
  // The status-line message for a draft this tab brought back, and the flag for
  // the Discard button beside it. Empty when nothing was restored.
  const [restored, setRestored] = useState('')

  async function refreshList() {
    try {
      const res = await fetch('/api/studio/blog')
      if (!res.ok) return setStatus('Could not load the post list')
      const data = await res.json()
      setPosts(data.posts ?? [])
      setKnownAuthors(data.knownAuthors ?? {})
    } catch {
      setStatus('Could not load the post list')
    }
  }

  // Derived rather than stored so it keeps tracking the title as it's typed;
  // an edit to the field wins from then on. Declared above save(), which reads it.
  const derivedBranch =
    branchName || branchNameFor('blog', { slug: slug || slugify(owned.title) })

  async function loadGit() {
    try {
      const res = await fetch('/api/studio/git')
      if (!res.ok) return setGit(null)
      const data: GitState = await res.json()
      setGit(data)
      setDirtyFiles(data.files)
      // A dirty tree can't be branched from; creating here stays available.
      if (data.dirty) setMakeBranch(false)
      return data
    } catch {
      setGit(null)
    }
  }

  // The form as it stands. Rebuilt every render; `snapshotKey` is what the draft
  // effect watches, since the object itself is a new identity each time.
  const snapshot: Snapshot = { mode, slug, owned, body, authorDids }
  const snapshotKey = JSON.stringify(snapshot)

  // Which document's draft this form owns. The new-post form keys off '' — the
  // slug typed into it is contents, not identity.
  const docSlug = mode === 'edit' ? slug : ''

  function applySnapshot(s: Snapshot) {
    setMode(s.mode)
    setSlug(s.slug)
    setOwned(s.owned)
    setBody(s.body)
    setAuthorDids(s.authorDids)
  }

  function newSnapshot(): Snapshot {
    return {
      mode: 'new',
      slug: '',
      owned: { ...EMPTY, date: todayLong() },
      body: '',
      authorDids: {},
    }
  }

  /**
   * Bring back a draft for `s` on top of what was just loaded from disk.
   *
   * The baseline stays as the on-disk state, so the restored form still reads as
   * changed and keeps its draft until it's saved. The revision comes from the
   * draft too — a restored draft conflicts with a file that moved on rather than
   * overwriting it.
   */
  function restoreDraft(s: string): boolean {
    const key = draftKey('blog', s)
    const draft = readDraft(key, s)
    if (!draft) return false
    // The schema version is the real guard, but a hand-edited or truncated draft
    // shouldn't be able to take the form down. Check what render depends on.
    const form = draft.form as Partial<Snapshot>
    if (!form.owned || typeof form.body !== 'string') {
      clearDraft(key)
      return false
    }
    applySnapshot(form as Snapshot)
    setRevision(draft.revision)
    setRestored(describeDraft(draft))
    return true
  }

  // Load from disk, then let any draft this tab holds for it come back on top.
  // Used from the URL on mount and from the post list — but never after a create,
  // and never from the conflict reload, where discarding the form is exactly what
  // was asked for.
  async function openPost(s: string): Promise<boolean> {
    const ok = await loadPost(s)
    if (ok) restoreDraft(s)
    return ok
  }

  function discardDraft() {
    clearDraft(draftKey('blog', docSlug))
    setRestored('')
  }

  // Throw away what was restored and go back to what's on disk — or to a blank
  // form, for a post that has no file yet.
  function discard() {
    discardDraft()
    if (mode === 'edit') loadPost(slug)
    else startNew()
  }

  useEffect(() => {
    refreshList()
    loadGit()
    // A slug in the URL means this tab already had a post open; restore it from
    // disk. If it won't load — deleted since, or a hand-edited URL — the form is
    // already in its new-post state, so only the stale param needs clearing.
    const open = slugFromSearch(window.location.search)
    if (open) {
      const clearIfMissing = (ok?: boolean) => {
        if (ok) return
        syncUrl('')
        setBaseline(snapshot)
      }
      openPost(open).then(clearIfMissing).catch(() => clearIfMissing())
      return
    }
    // The initial state already *is* the new-post form, so adopt it as the
    // baseline rather than reading the clock a second time and risking a form
    // that reads as changed before anything was typed.
    setBaseline(snapshot)
    restoreDraft('')
  }, [])

  // Keep the draft in step with the form, so an unexpected reload has something
  // to come back to. Debounced only to avoid a write per keystroke — the write
  // itself is synchronous and the payload is small.
  useEffect(() => {
    if (!baseline) return
    const key = draftKey('blog', docSlug)
    if (!isDirty(snapshot, baseline)) {
      clearDraft(key)
      return
    }
    const timer = window.setTimeout(() => {
      // A draft already holding this exact form is left alone. Rewriting it would
      // only move `savedAt` forward, and then "unsaved changes from 3:42" would
      // report the last reload rather than the last edit.
      const stored = readDraft(key, docSlug)
      if (stored && !isDirty(snapshot, stored.form)) return
      writeDraft(key, {
        v: DRAFT_SCHEMA,
        slug: docSlug,
        mode,
        savedAt: new Date().toISOString(),
        revision,
        form: snapshot,
      })
    }, 300)
    return () => window.clearTimeout(timer)
    // snapshotKey stands in for `snapshot`, which is a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotKey, baseline, docSlug, mode, revision])

  // A draft only lives as long as the tab, so closing it — or navigating off
  // /studio — loses work that a reload would have brought back. This is the one
  // moment the browser lets us speak up. Registered once and reading a ref, so
  // typing doesn't swap the listener on every keystroke.
  const unsaved = baseline !== null && isDirty(snapshot, baseline)
  const unsavedRef = useRef(false)
  useEffect(() => {
    unsavedRef.current = unsaved
  }, [unsaved])
  useEffect(() => guardUnload(window, () => unsavedRef.current), [])

  function startNew() {
    // Only the new-post form's own draft goes. A draft for the post being left is
    // kept on purpose: clicking back to it in the list brings the work back,
    // which is the whole point of keeping drafts per document.
    clearDraft(draftKey('blog', ''))
    setRestored('')
    syncUrl('')
    const s = newSnapshot()
    applySnapshot(s)
    setBaseline(s)
    setSsiteUri('')
    setOgImage(null)
    setDragging(false)
    setStatus('')
    setRevision('')
    setConflict(false)
    setBranchName('')
    setMakeBranch(true)
    loadGit()
  }

  // Returns whether the post loaded, so the mount effect can tell a stale slug in
  // the URL from a good one.
  async function loadPost(s: string): Promise<boolean> {
    const res = await fetch(`/api/studio/blog/${s}`)
    if (!res.ok) {
      setStatus(`Error loading ${s}`)
      return false
    }
    const data = await res.json()
    const loaded: Snapshot = {
      mode: 'edit',
      slug: s,
      owned: data.owned,
      body: data.body,
      authorDids: {},
    }
    applySnapshot(loaded)
    setBaseline(loaded)
    setRestored('')
    syncUrl(s)
    setSsiteUri(data.standardSiteUri || '')
    setOgImage(data.ogImage ?? null)
    setOgVersion((v) => v + 1)
    setRevision(data.revision ?? '')
    setConflict(false)
    setStatus('')
    return true
  }

  // Update the standard.site URI field from a publish result. Publish state is
  // reflected inline in the standard.site record section, not the top status
  // line (which is about the post save), to avoid ambiguity. Returns the
  // failure status line to show, or null if the publish succeeded (or there
  // was nothing to publish) — callers must let this win over their own
  // success message, since a failed republish here means bskyPostRef never
  // made it onto the record.
  function applyPublish(pub: Publish | undefined): string | null {
    if (pub?.uri) setSsiteUri(pub.uri)
    return pub && !pub.ok ? `standard.site publish failed: ${pub.error ?? 'unknown'}` : null
  }

  async function save() {
    // Persist exactly what the publish step will parse (bskyPostUrl.ts
    // validates trimmed; the header must hold the same trimmed value).
    const cleanedOwned: Owned = { ...owned, blueskyPostUrl: owned.blueskyPostUrl.trim() }
    if (mode === 'new') {
      const finalSlug = slug || slugify(owned.title)
      if (!finalSlug) return setStatus('Add a title or slug first')
      setStatus('Saving…')
      const res = await fetch('/api/studio/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: finalSlug,
          ...cleanedOwned,
          authorDids,
          body,
          branch: makeBranch && derivedBranch ? { name: derivedBranch } : undefined,
        }),
      })
      const data = await res.json()
      if (res.status === 409) {
        // Dirty tree: nothing was branched and nothing was written. Untick the
        // box so a retry creates here instead.
        setDirtyFiles(data.files ?? [])
        setMakeBranch(false)
        await loadGit()
        return setStatus(`Error: ${data.error}`)
      }
      if (!res.ok) return setStatus(`Error: ${data.error}`)
      // Reveal step 2: load the created post (body placeholder, ssite, og image)
      // from disk, then show a plain save status.
      await loadPost(data.slug)
      // The post exists now, so the new-post draft has nothing left to recover.
      // Cleared *after* the load, not before: the create request takes longer
      // than the draft debounce, so a write scheduled before it started would
      // otherwise land after the clear and leave a stale draft behind.
      clearDraft(draftKey('blog', ''))
      const publishError = applyPublish(data.publish)
      const where = data.branch?.created ? ` on ${data.branch.name}` : ''
      setStatus(publishError ?? data.warning ?? `Created ${data.slug}${where}`)
      await loadGit()
      await refreshList()
    } else {
      setStatus('Saving…')
      const res = await fetch(`/api/studio/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owned: cleanedOwned, body, revision, authorDids }),
      })
      const data = await res.json()
      if (res.status === 409) {
        // The file moved on since this form loaded. Nothing was written, so the
        // call is the author's: reload and lose these edits, or copy them out
        // first. Never resolve it silently — that is the bug this prevents.
        setConflict(true)
        return setStatus(`Error: ${data.error}`)
      }
      if (!res.ok) return setStatus(`Error: ${data.error}`)
      // Smart typography is applied server-side; show the stored strings so the
      // form doesn't keep displaying straight quotes the file no longer has.
      const stored: Owned = data.owned
        ? { ...owned, title: data.owned.title, description: data.owned.description }
        : owned
      if (data.owned) setOwned(stored)
      // What's on disk now is what's on screen, so this becomes the baseline and
      // the draft has nothing left to recover. authorDids is cleared just below,
      // so the baseline records it empty.
      setBaseline({ ...snapshot, owned: stored, authorDids: {} })
      discardDraft()
      // Adopt the revision this save created, or the next save from this same
      // open tab would conflict with its own write.
      if (data.revision) setRevision(data.revision)
      setConflict(false)
      const publishError = applyPublish(data.publish)
      // Recorded DIDs come back in knownAuthors on the next refresh, so the
      // prompt disappears on its own; drop what was typed either way.
      setAuthorDids({})
      setStatus(publishError ?? data.warning ?? `Saved ${data.slug}`)
      await refreshList()
    }
  }

  async function publishNow() {
    if (mode !== 'edit') return
    setStatus('Publishing…')
    const res = await fetch(`/api/studio/blog/${slug}/publish`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return setStatus(`Error: ${data.error}`)
    const pub: Publish | undefined = data.publish
    // Publish state shows inline with the record; only surface failures up top.
    setStatus(applyPublish(pub) ?? '')
  }

  async function uploadOgImage(file: File) {
    if (mode !== 'edit') return
    setStatus('Uploading image…')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/studio/blog/${slug}/og-image`, {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    if (!res.ok) return setStatus(`Error: ${data.error}`)
    setOgImage(data.filename)
    setOgVersion((v) => v + 1)
    setStatus(`OG image saved (${data.filename})`)
  }

  async function remove() {
    if (mode !== 'edit') return
    if (!confirm(`Delete "${owned.title || slug}"? This deletes the post directory and posts.ts entry. Recoverable from git if committed.`)) {
      return
    }
    const res = await fetch(`/api/studio/blog/${slug}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return setStatus(`Error: ${data.error}`)
    // The post is gone; a draft keyed to it would be offered for a document that
    // no longer exists.
    clearDraft(draftKey('blog', slug))
    setStatus(`Deleted ${slug}`)
    startNew()
    await refreshList()
  }

  async function copyUri() {
    try {
      await navigator.clipboard.writeText(ssiteUri)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard blocked — ignore
    }
  }

  // A post has a single author, so this is at most one name — but the same
  // helper and the same shape as the episode editor's hosts + guests.
  const missingDids = unknownAuthors(knownAuthors, [owned.author])

  const set = (k: keyof Owned) => (e: { target: { value: string } }) =>
    setOwned((o) => ({ ...o, [k]: e.target.value }))

  const statusTone = status.startsWith('Error') || status.startsWith('Could not')
    ? 'text-red-600'
    : status.includes('publish failed')
      ? 'text-amber-600'
      : 'text-neutral-500'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Post list (left, newest first) */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-neutral-200 px-5 py-6">
        <StudioNav active="blog" />
        <button
          onClick={startNew}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          + New post
        </button>

        <p className="mt-8 mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
          Posts
        </p>
        <ul className="-mx-2 flex min-h-0 flex-col gap-0.5 overflow-y-auto">
          {posts.map((p) => {
            const active = mode === 'edit' && p.slug === slug
            return (
              <li key={p.slug}>
                <button
                  onClick={() => openPost(p.slug)}
                  className={
                    'block w-full rounded-md px-2 py-1.5 text-left transition ' +
                    (active
                      ? 'bg-neutral-900/[0.06] text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-900/[0.04] hover:text-neutral-900')
                  }
                  title={p.title}
                >
                  <span className="block truncate text-sm">{p.title}</span>
                  {p.date && (
                    <span className="mt-0.5 block font-mono text-[0.7rem] text-neutral-400">
                      {p.date}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
          {posts.length === 0 && (
            <li className="px-2 py-1.5 text-sm italic text-neutral-400">
              No posts yet
            </li>
          )}
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Action bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/85 px-8 py-3 backdrop-blur">
          <div className="flex items-baseline gap-3 text-sm">
            <span className="font-semibold tracking-tight">Blog</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-500">
              {mode === 'new' ? 'New post' : 'Editing'}
            </span>
            {mode === 'edit' && (
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-500"
              >
                /blog/{slug} ↗
              </a>
            )}
            {git && (
              <span className="font-mono text-xs text-neutral-400">
                on {git.branch}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {status && (
              <span className={'text-sm ' + statusTone} aria-live="polite">
                {status}
              </span>
            )}
            {/* A draft this tab brought back after a reload. Says so rather than
                leaving it ambiguous whether the form reflects the file on disk,
                and offers the one-click way out. */}
            {restored && (
              <span
                className="flex items-baseline gap-2 text-sm text-neutral-500"
                aria-live="polite"
              >
                {restored}
                <span className="text-neutral-300">·</span>
                <button
                  onClick={discard}
                  className="underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-500"
                >
                  Discard
                </button>
              </span>
            )}
            {/* Only offered on a conflict, and it discards the form's edits — so
                it says so rather than looking like an ordinary refresh. */}
            {conflict && (
              <button
                onClick={() => {
                  if (
                    confirm('Reload from disk? Unsaved changes in this form are lost.')
                  ) {
                    // Reloading from disk is a choice to abandon the form, so the
                    // draft goes too — otherwise the next reload would hand these
                    // same edits straight back.
                    discardDraft()
                    loadPost(slug)
                  }
                }}
                className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                Reload from disk
              </button>
            )}
            {mode === 'edit' && (
              <button
                onClick={remove}
                className="text-sm text-neutral-400 transition hover:text-red-600"
              >
                Delete
              </button>
            )}
            {mode === 'edit' && (
              <button
                onClick={save}
                className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Compose area */}
        <div className="mx-auto max-w-3xl px-8 py-10">
          <input
            value={owned.title}
            onChange={set('title')}
            placeholder="Untitled post"
            className="w-full bg-transparent text-4xl font-semibold leading-tight tracking-tight text-neutral-900 outline-none placeholder:text-neutral-300"
          />
          {/* A textarea so long descriptions wrap instead of scrolling out of
              sight. field-sizing:content grows it to fit where supported;
              rows=2 is the fallback height elsewhere. The value stays
              single-line — Enter is ignored and pasted breaks fold to spaces —
              because this is one MDX header field and one line in posts.ts. */}
          <textarea
            value={owned.description}
            onChange={(e) =>
              setOwned((o) => ({ ...o, description: singleLine(e.target.value) }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault()
            }}
            rows={2}
            placeholder="A one- or two-sentence description…"
            className="mt-3 w-full resize-none bg-transparent text-lg text-neutral-600 outline-none [field-sizing:content] placeholder:text-neutral-300"
          />

          {/* Meta */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-neutral-200 pt-6">
            <Field label="Date">
              <input
                value={owned.date}
                onChange={set('date')}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            </Field>
            <Field label="Author">
              <input
                value={owned.author}
                onChange={set('author')}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-neutral-500"
              />
            </Field>

            {mode === 'new' ? (
              <>
                <Field label="Slug" hint="blank = from title">
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={slugify(owned.title) || 'my-post'}
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-mono text-sm outline-none focus:border-neutral-500"
                  />
                </Field>
              </>
            ) : (
              <Field label="Slug" hint="read-only — delete & recreate to rename">
                <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-sm text-neutral-500">
                  {slug}
                </div>
              </Field>
            )}
          </div>

          {/* Replaces the old always-visible "Author DID" field, which only
              appeared when creating a post and never said whether the author was
              actually unknown. This appears only when authors.json has no DID for
              the name, and it appears while editing too — an author usually turns
              out to be unknown after the post exists. */}
          {missingDids.length > 0 && (
            <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3">
              <p className="text-sm text-neutral-700">
                <span className="font-medium">{missingDids[0]}</span> is not in
                authors.json. Add a DID to link the byline to a Bluesky profile, or
                leave blank and the name renders as plain text.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  value={authorDids[missingDids[0]] ?? ''}
                  onChange={(e) =>
                    setAuthorDids((d) => ({ ...d, [missingDids[0]]: e.target.value }))
                  }
                  placeholder="did:plc:…"
                  aria-label={`DID for ${missingDids[0]}`}
                  aria-invalid={
                    ((authorDids[missingDids[0]] ?? '').trim() !== '' &&
                      !isValidDid(authorDids[missingDids[0]] ?? '')) ||
                    undefined
                  }
                  className={
                    'w-full rounded-md border bg-white px-3 py-1.5 font-mono text-sm outline-none ' +
                    ((authorDids[missingDids[0]] ?? '').trim() !== '' &&
                    !isValidDid(authorDids[missingDids[0]] ?? '')
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-neutral-300 focus:border-neutral-500')
                  }
                />
              </div>
              {(authorDids[missingDids[0]] ?? '').trim() !== '' &&
                !isValidDid(authorDids[missingDids[0]] ?? '') && (
                  <p className="mt-2 text-xs text-red-700">
                    A DID looks like <span className="font-mono">did:plc:…</span> or{' '}
                    <span className="font-mono">did:web:…</span>. Anything else is left
                    out of authors.json.
                  </p>
                )}
            </div>
          )}

          {mode === 'new' && (
            <div className="mt-6 border-t border-neutral-200 pt-6">
              <p className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                Branch
              </p>
              {git?.dirty ? (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-neutral-700">
                  <p>
                    Can’t branch: {dirtyFiles.length} uncommitted change
                    {dirtyFiles.length === 1 ? '' : 's'} on{' '}
                    <span className="font-mono">{git.branch}</span>. Commit or stash
                    them to branch, or create here anyway.
                  </p>
                  <ul className="mt-1 font-mono text-xs text-neutral-500">
                    {dirtyFiles.slice(0, 5).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    {dirtyFiles.length > 5 && <li>…and {dirtyFiles.length - 5} more</li>}
                  </ul>
                </div>
              ) : (
                <>
                  <label className="flex items-center gap-2 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={makeBranch}
                      onChange={(e) => setMakeBranch(e.target.checked)}
                    />
                    Create a branch from origin/main
                  </label>
                  {makeBranch && (
                    <>
                      <input
                        value={derivedBranch}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="mt-2 w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-mono text-sm outline-none focus:border-neutral-500"
                      />
                      <pre className="mt-2 overflow-x-auto rounded bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-500">
                        git fetch origin main{'\n'}git checkout -b {derivedBranch} origin/main
                      </pre>
                    </>
                  )}
                  {git && (
                    <p className="mt-2 text-xs text-neutral-500">
                      Currently on <span className="font-mono">{git.branch}</span> ·
                      working tree clean
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {mode === 'new' && (
            <div className="mt-6 flex flex-col items-end gap-2 border-t border-neutral-200 pt-6">
              <button
                onClick={save}
                className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                Create post
              </button>
              <span className="text-xs italic text-neutral-400">
                Body, Open Graph image, and standard.site record appear after you
                create the post.
              </span>
            </div>
          )}

          {/* standard.site record */}
          {mode === 'edit' && (
            <div className="mt-6">
              <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                standard.site record
              </p>
              {/* Sits with the record rather than in the meta grid because the
                  two are one motion: paste the thread URL, Save, and the save's
                  automatic republish writes bskyPostRef onto the record. */}
              <div className="mb-4">
                <span className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                  Bluesky post URL
                </span>
                <input
                  value={owned.blueskyPostUrl}
                  onChange={set('blueskyPostUrl')}
                  placeholder="https://bsky.app/profile/…/post/…"
                  aria-label="Bluesky post URL"
                  aria-invalid={
                    (owned.blueskyPostUrl.trim() !== '' &&
                      !isBskyPostUrl(owned.blueskyPostUrl)) ||
                    undefined
                  }
                  className={
                    'w-full rounded-md border bg-white px-3 py-1.5 font-mono text-sm outline-none ' +
                    (owned.blueskyPostUrl.trim() !== '' &&
                    !isBskyPostUrl(owned.blueskyPostUrl)
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-neutral-300 focus:border-neutral-500')
                  }
                />
                {owned.blueskyPostUrl.trim() !== '' &&
                !isBskyPostUrl(owned.blueskyPostUrl) ? (
                  <p className="mt-1 text-xs text-red-700">
                    Needs the form{' '}
                    <span className="font-mono">
                      https://bsky.app/profile/&lt;handle&gt;/post/&lt;id&gt;
                    </span>{' '}
                    — that's what the publish step parses to build the record's
                    bskyPostRef.
                  </p>
                ) : (
                  <p className="mt-1 text-xs italic text-neutral-400">
                    Drives the discussion section. Saving republishes the record,
                    which is what puts the thread on the live page.
                  </p>
                )}
              </div>
              {ssiteUri ? (
                <div>
                  <code
                    className="block w-full truncate rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs text-neutral-600"
                    title={ssiteUri}
                  >
                    {ssiteUri}
                  </code>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={copyUri}
                      className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={`https://pdsls.dev/${ssiteUri}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      pdsls ↗
                    </a>
                    <button
                      onClick={publishNow}
                      className="ml-auto rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm italic text-neutral-400">
                    Not published yet — Save or Publish to create the record.
                  </p>
                  <button
                    onClick={publishNow}
                    className="ml-auto rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Publish
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Open Graph image */}
          {mode === 'edit' && (
            <div className="mt-6">
              <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                Open Graph image
              </p>
              <label
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) uploadOgImage(file)
                }}
                className={
                  'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition ' +
                  (dragging
                    ? 'border-neutral-500 bg-neutral-50'
                    : 'border-neutral-300 hover:border-neutral-400')
                }
              >
                {ogImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/studio/blog/${slug}/og-image?v=${ogVersion}`}
                    alt="Open Graph preview"
                    className="mb-3 max-h-40 rounded border border-neutral-200"
                  />
                )}
                <span className="text-sm text-neutral-500">
                  {ogImage
                    ? 'Drop a new image to replace, or click to choose'
                    : 'Drag an image here, or click to choose'}
                </span>
                <span className="mt-1 text-xs text-neutral-400">
                  PNG, JPG, or GIF · saved as opengraph-image in the post dir
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadOgImage(file)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
          )}

          {/* Body (revealed after the post is created) */}
          {mode === 'edit' && (
            <div className="mt-8">
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                Body — MDX
              </p>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                spellCheck={false}
                placeholder={'# Title\n\nWrite the MDX body here…'}
                className="min-h-[26rem] w-full resize-y rounded-lg border border-neutral-300 bg-white p-4 font-mono text-sm leading-7 text-neutral-800 outline-none focus:border-neutral-500 placeholder:text-neutral-300"
              />
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
          {label}
        </span>
        {hint && <span className="text-xs italic text-neutral-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
