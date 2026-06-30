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
    const res = await fetch('/api/studio/blog')
    const data = await res.json()
    setPosts(data.posts ?? [])
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
    setStatus('Saving…')
    if (mode === 'new') {
      const finalSlug = slug || slugify(owned.title)
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

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24, fontFamily: 'system-ui' }}>
      <aside style={{ width: 220 }}>
        <button onClick={startNew}>+ New post</button>
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
          {posts.map((p) => (
            <li key={p.slug}>
              <button
                onClick={() => loadPost(p.slug)}
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '4px 0' }}
              >
                {p.title}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h1>{mode === 'new' ? 'New blog post' : `Editing: ${slug}`}</h1>
        {mode === 'new' && (
          <label>
            Slug (blank = from title){' '}
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(owned.title)} />
          </label>
        )}
        {mode === 'edit' && (
          <p>
            Slug: <code>{slug}</code>{' '}
            <a href={`/blog/${slug}`} target="_blank" rel="noreferrer">Open /blog/{slug} ↗</a>
          </p>
        )}
        <label>Title <input value={owned.title} onChange={set('title')} /></label>
        <label>Description <input value={owned.description} onChange={set('description')} /></label>
        <label>Date <input value={owned.date} onChange={set('date')} /></label>
        <label>Author <input value={owned.author} onChange={set('author')} /></label>
        {mode === 'new' && (
          <label>Author DID (only if new author) <input value={authorDid} onChange={(e) => setAuthorDid(e.target.value)} /></label>
        )}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={24}
          style={{ fontFamily: 'monospace', width: '100%' }}
          placeholder="# Title&#10;&#10;Write the MDX body here…"
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save}>Save</button>
          {mode === 'edit' && <button onClick={remove}>Delete</button>}
          <span>{status}</span>
        </div>
      </main>
    </div>
  )
}
