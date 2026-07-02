'use client'

import { useEffect, useState } from 'react'

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
  const [status, setStatus] = useState<string>('')
  const [copied, setCopied] = useState(false)

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

  useEffect(() => {
    refreshList()
  }, [])

  function startNew() {
    setMode('new')
    setSlug('')
    setOwned({ ...EMPTY, date: todayLong() })
    setAuthorDid('')
    setBody('')
    setSsiteUri('')
    setStatus('')
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
    setStatus('')
  }

  // Fold a publish result into the URI field + status line.
  function applyPublish(pub: Publish | undefined, prefix: string) {
    if (pub?.uri) setSsiteUri(pub.uri)
    if (!pub) return setStatus(prefix)
    setStatus(
      pub.ok
        ? `${prefix} · published`
        : `${prefix} · publish failed: ${pub.error ?? 'unknown'}`,
    )
  }

  async function save() {
    if (mode === 'new') {
      const finalSlug = slug || slugify(owned.title)
      if (!finalSlug) return setStatus('Add a title or slug first')
      setStatus('Saving…')
      const res = await fetch('/api/studio/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: finalSlug, ...owned, authorDid: authorDid || undefined, body }),
      })
      const data = await res.json()
      if (!res.ok) return setStatus(`Error: ${data.error}`)
      setMode('edit')
      setSlug(data.slug)
      applyPublish(data.publish, `Created ${data.slug}`)
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
      applyPublish(data.publish, `Saved ${data.slug}`)
      await refreshList()
    }
  }

  async function publishNow() {
    if (mode !== 'edit') return
    setStatus('Publishing…')
    const res = await fetch(`/api/studio/blog/${slug}/publish`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return setStatus(`Error: ${data.error}`)
    applyPublish(data.publish, 'Publish')
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
            <span className="font-semibold tracking-tight">Studio</span>
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
          </div>
          <div className="flex items-center gap-4">
            {status && (
              <span className={'text-sm ' + statusTone} aria-live="polite">
                {status}
              </span>
            )}
            {mode === 'edit' && (
              <button
                onClick={publishNow}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
              >
                Publish
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
            <button
              onClick={save}
              className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Save
            </button>
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
          <input
            value={owned.description}
            onChange={set('description')}
            placeholder="A one- or two-sentence description…"
            className="mt-3 w-full bg-transparent text-lg text-neutral-600 outline-none placeholder:text-neutral-300"
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

          {/* standard.site record */}
          {mode === 'edit' && (
            <div className="mt-6">
              <p className="mb-1.5 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">
                standard.site record
              </p>
              {ssiteUri ? (
                <div className="flex items-center gap-2">
                  <code
                    className="min-w-0 flex-1 truncate rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs text-neutral-600"
                    title={ssiteUri}
                  >
                    {ssiteUri}
                  </code>
                  <button
                    onClick={copyUri}
                    className="shrink-0 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <a
                    href={`https://pdsls.dev/${ssiteUri}`}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    pdsls ↗
                  </a>
                </div>
              ) : (
                <p className="text-sm italic text-neutral-400">
                  Not published yet — Save or Publish to create the record.
                </p>
              )}
            </div>
          )}

          {/* Body */}
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
