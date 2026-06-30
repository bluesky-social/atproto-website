'use client'

import { useEffect, useState } from 'react'

type PostListItem = { slug: string; title: string }
type Owned = { title: string; description: string; date: string; author: string }

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
  const [status, setStatus] = useState<string>('')

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
    setStatus('')
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
      setStatus(`Created ${data.slug}`)
      setMode('edit')
      setSlug(data.slug)
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
      setStatus(`Saved ${data.slug}`)
      await refreshList()
    }
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

  const set = (k: keyof Owned) => (e: { target: { value: string } }) =>
    setOwned((o) => ({ ...o, [k]: e.target.value }))

  const isError = status.startsWith('Error') || status.startsWith('Could not')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-stone-200/70 px-5 py-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-medium tracking-tight text-stone-900">
            Studio
          </span>
          <span className="font-display text-2xl font-normal italic text-stone-400">
            blog
          </span>
        </div>

        <button
          onClick={startNew}
          className="mt-6 rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-[#faf8f3] transition hover:bg-stone-700"
        >
          + New post
        </button>

        <p className="mt-8 mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-stone-400">
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
                    'w-full truncate rounded-md px-2 py-1.5 text-left text-sm transition ' +
                    (active
                      ? 'bg-stone-900/[0.06] font-medium text-stone-900'
                      : 'text-stone-600 hover:bg-stone-900/[0.04] hover:text-stone-900')
                  }
                  title={p.title}
                >
                  {p.title}
                </button>
              </li>
            )
          })}
          {posts.length === 0 && (
            <li className="px-2 py-1.5 text-sm italic text-stone-400">
              No posts yet
            </li>
          )}
        </ul>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Action bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-stone-200/70 bg-[#faf8f3]/85 px-8 py-3 backdrop-blur">
          <div className="flex items-baseline gap-3 text-sm">
            <span className="text-stone-500">
              {mode === 'new' ? 'New post' : 'Editing'}
            </span>
            {mode === 'edit' && (
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-[#9a3412] underline decoration-[#9a3412]/30 underline-offset-4 hover:decoration-[#9a3412]"
              >
                /blog/{slug} ↗
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            {status && (
              <span
                className={
                  'text-sm ' + (isError ? 'text-red-700' : 'text-stone-500')
                }
                aria-live="polite"
              >
                {status}
              </span>
            )}
            {mode === 'edit' && (
              <button
                onClick={remove}
                className="text-sm text-stone-400 transition hover:text-red-700"
              >
                Delete
              </button>
            )}
            <button
              onClick={save}
              className="rounded-md bg-stone-900 px-4 py-1.5 text-sm font-medium text-[#faf8f3] transition hover:bg-stone-700"
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
            className="font-display w-full bg-transparent text-4xl font-medium leading-tight tracking-tight text-stone-900 outline-none"
          />
          <input
            value={owned.description}
            onChange={set('description')}
            placeholder="A one- or two-sentence description…"
            className="mt-3 w-full bg-transparent text-lg text-stone-600 outline-none"
          />

          {/* Meta */}
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-stone-200/70 pt-6">
            <Field label="Date">
              <input
                value={owned.date}
                onChange={set('date')}
                className="w-full rounded-md border border-stone-300/70 bg-white/60 px-3 py-1.5 text-sm outline-none focus:border-stone-400"
              />
            </Field>
            <Field label="Author">
              <input
                value={owned.author}
                onChange={set('author')}
                className="w-full rounded-md border border-stone-300/70 bg-white/60 px-3 py-1.5 text-sm outline-none focus:border-stone-400"
              />
            </Field>

            {mode === 'new' ? (
              <>
                <Field label="Slug" hint="blank = from title">
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={slugify(owned.title) || 'my-post'}
                    className="w-full rounded-md border border-stone-300/70 bg-white/60 px-3 py-1.5 font-mono text-sm outline-none focus:border-stone-400"
                  />
                </Field>
                <Field label="Author DID" hint="only if new author">
                  <input
                    value={authorDid}
                    onChange={(e) => setAuthorDid(e.target.value)}
                    placeholder="did:plc:…"
                    className="w-full rounded-md border border-stone-300/70 bg-white/60 px-3 py-1.5 font-mono text-sm outline-none focus:border-stone-400"
                  />
                </Field>
              </>
            ) : (
              <Field label="Slug" hint="read-only — delete & recreate to rename">
                <div className="rounded-md border border-stone-200/70 bg-stone-100/60 px-3 py-1.5 font-mono text-sm text-stone-500">
                  {slug}
                </div>
              </Field>
            )}
          </div>

          {/* Body */}
          <div className="mt-8">
            <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-stone-400">
              Body — MDX
            </p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
              placeholder={'# Title\n\nWrite the MDX body here…'}
              className="min-h-[26rem] w-full resize-y rounded-lg border border-stone-300/70 bg-white/70 p-4 font-mono text-sm leading-7 text-stone-800 outline-none focus:border-stone-400"
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
        <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-stone-400">
          {label}
        </span>
        {hint && <span className="text-xs italic text-stone-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
