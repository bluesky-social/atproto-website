'use client'

import { useEffect, useState } from 'react'
// Pure module, and a type-only import that TypeScript erases: this is a client
// component, so nothing reaching node:child_process may be imported here.
import { branchNameFor } from '@/lib/gitNames.mjs'
import { singleLine } from '@/lib/studio/text'
import type { GitState } from '@/lib/studio/git'
import { StudioNav } from '../StudioNav'

type PostListItem = { slug: string; title: string; date: string }
type Owned = { title: string; description: string; date: string; author: string }
type Publish = { ok: boolean; uri?: string; error?: string }

const EMPTY: Owned = { title: '', description: '', date: '', author: '' }

function todayLong(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
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
  const [authorDid, setAuthorDid] = useState('')
  const [body, setBody] = useState('')
  const [ssiteUri, setSsiteUri] = useState('')
  const [ogImage, setOgImage] = useState<string | null>(null)
  const [ogVersion, setOgVersion] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [git, setGit] = useState<GitState | null>(null)
  const [makeBranch, setMakeBranch] = useState(true)
  const [branchName, setBranchName] = useState('')
  const [dirtyFiles, setDirtyFiles] = useState<string[]>([])

  async function refreshList() {
    try {
      const res = await fetch('/api/studio/blog')
      if (!res.ok) return setStatus('Could not load the post list')
      const data = await res.json()
      setPosts(data.posts ?? [])
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

  useEffect(() => {
    refreshList()
    loadGit()
  }, [])

  function startNew() {
    setMode('new')
    setSlug('')
    setOwned({ ...EMPTY, date: todayLong() })
    setAuthorDid('')
    setBody('')
    setSsiteUri('')
    setOgImage(null)
    setDragging(false)
    setStatus('')
    setBranchName('')
    setMakeBranch(true)
    loadGit()
  }

  async function loadPost(s: string) {
    const res = await fetch(`/api/studio/blog/${s}`)
    if (!res.ok) {
      setStatus(`Error loading ${s}`)
      return
    }
    const data = await res.json()
    setMode('edit')
    setSlug(s)
    setOwned(data.owned)
    setAuthorDid('')
    setBody(data.body)
    setSsiteUri(data.standardSiteUri || '')
    setOgImage(data.ogImage ?? null)
    setOgVersion((v) => v + 1)
    setStatus('')
  }

  // Update the standard.site URI field from a publish result. Publish state is
  // reflected inline in the standard.site record section, not the top status
  // line (which is about the post save), to avoid ambiguity.
  function applyPublish(pub: Publish | undefined) {
    if (pub?.uri) setSsiteUri(pub.uri)
  }

  async function save() {
    if (mode === 'new') {
      const finalSlug = slug || slugify(owned.title)
      if (!finalSlug) return setStatus('Add a title or slug first')
      setStatus('Saving…')
      const res = await fetch('/api/studio/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: finalSlug,
          ...owned,
          authorDid: authorDid || undefined,
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
      applyPublish(data.publish)
      const where = data.branch?.created ? ` on ${data.branch.name}` : ''
      setStatus(data.warning ?? `Created ${data.slug}${where}`)
      await loadGit()
      await refreshList()
    } else {
      setStatus('Saving…')
      const res = await fetch(`/api/studio/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owned, body }),
      })
      const data = await res.json()
      if (!res.ok) return setStatus(`Error: ${data.error}`)
      // Smart typography is applied server-side; show the stored strings so the
      // form doesn't keep displaying straight quotes the file no longer has.
      if (data.owned) {
        setOwned((o) => ({
          ...o,
          title: data.owned.title,
          description: data.owned.description,
        }))
      }
      applyPublish(data.publish)
      setStatus(`Saved ${data.slug}`)
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
    applyPublish(pub)
    // Publish state shows inline with the record; only surface failures up top.
    setStatus(pub && !pub.ok ? `standard.site publish failed: ${pub.error ?? 'unknown'}` : '')
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

  const set = (k: keyof Owned) => (e: { target: { value: string } }) =>
    setOwned((o) => ({ ...o, [k]: e.target.value }))

  const statusTone = status.startsWith('Error') || status.startsWith('Could not')
    ? 'text-red-600'
    : status.includes('publish failed')
      ? 'text-amber-600'
      : 'text-neutral-500'

  return (
    <div className="flex min-h-screen">
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
        <ul className="-mx-2 flex flex-col gap-0.5 overflow-y-auto">
          {posts.map((p) => {
            const active = mode === 'edit' && p.slug === slug
            return (
              <li key={p.slug}>
                <button
                  onClick={() => loadPost(p.slug)}
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
                <Field label="Author DID" hint="only if new author">
                  <input
                    value={authorDid}
                    onChange={(e) => setAuthorDid(e.target.value)}
                    placeholder="did:plc:…"
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
