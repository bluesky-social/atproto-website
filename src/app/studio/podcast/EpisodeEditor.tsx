'use client'

import { useEffect, useState } from 'react'
import {
  isoToLocalInput,
  localInputToIso,
  isoToHumanDate,
} from '@/lib/studio/episodeDates'
// Pure module, and a type-only import that TypeScript erases: this is a client
// component, so nothing reaching node:child_process may be imported here.
import { branchNameFor } from '@/lib/gitNames.mjs'
import type { GitState } from '@/lib/studio/git'
import { StudioNav } from '../StudioNav'

type ListItem = { slug: string; title: string; episodeNumber: number }
type Fields = {
  episodeNumber: number
  title: string
  description: string
  date: string
  pubDate: string
  hosts: string[]
  duration: string
  durationSeconds: number
  guests: string[]
  audioUrl: string
  audioSizeBytes: number
  audioMimeType: string
  hasShowNotes: boolean
  hasTranscript: boolean
  explicit: boolean
  // Not editable here — the episode page renders a discussion thread from it,
  // so it's carried through load → save untouched and set by hand in en.mdx.
  blueskyPostUrl: string
}

function slugify(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function fmtDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
// The clock is read on mount, never during render: this component is server-
// rendered first, and a timestamp baked into the initial state would hydrate
// against a different value a second later.
function nowDates(): Pick<Fields, 'date' | 'pubDate'> {
  const now = new Date().toISOString()
  return { pubDate: now, date: isoToHumanDate(now) }
}
function emptyFields(nextNumber: number): Fields {
  return {
    episodeNumber: nextNumber,
    title: '',
    description: '',
    date: '',
    pubDate: '',
    hosts: ['Jim Ray'],
    duration: '',
    durationSeconds: 0,
    guests: [],
    audioUrl: '',
    audioSizeBytes: 0,
    audioMimeType: 'audio/mpeg',
    hasShowNotes: false,
    hasTranscript: false,
    explicit: false,
    blueskyPostUrl: '',
  }
}

export function EpisodeEditor() {
  const [episodes, setEpisodes] = useState<ListItem[]>([])
  const [nextNumber, setNextNumber] = useState(1)
  const [mode, setMode] = useState<'new' | 'edit'>('new')
  const [slug, setSlug] = useState('')
  const [fields, setFields] = useState<Fields>(emptyFields(1))
  const [body, setBody] = useState('')
  const [ogImage, setOgImage] = useState<string | null>(null)
  const [ogVersion, setOgVersion] = useState(0)
  const [status, setStatus] = useState('')
  const [git, setGit] = useState<GitState | null>(null)
  const [makeBranch, setMakeBranch] = useState(true)
  const [branchName, setBranchName] = useState('')
  const [dirtyFiles, setDirtyFiles] = useState<string[]>([])

  async function refreshList() {
    try {
      const res = await fetch('/api/studio/podcast')
      if (!res.ok) return setStatus('Could not load the episode list')
      const data = await res.json()
      setEpisodes(data.episodes ?? [])
      setNextNumber(data.nextNumber ?? 1)
      return data.nextNumber ?? 1
    } catch {
      setStatus('Could not load the episode list')
    }
  }

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
    const dates = nowDates()
    setFields((f) => ({ ...f, ...dates }))
    setBranchName(branchNameFor('podcast', { pubDate: dates.pubDate }))
    loadGit()
    refreshList().then((n) => {
      if (typeof n === 'number') setFields((f) => ({ ...f, episodeNumber: n }))
    })
  }, [])

  function startNew() {
    setMode('new')
    setSlug('')
    const dates = nowDates()
    setFields({ ...emptyFields(nextNumber), ...dates })
    setBody('')
    setOgImage(null)
    setStatus('')
    setBranchName(branchNameFor('podcast', { pubDate: dates.pubDate }))
    setMakeBranch(true)
    loadGit()
  }

  async function loadEpisode(s: string) {
    const res = await fetch(`/api/studio/podcast/${s}`)
    if (!res.ok) return setStatus(`Error loading ${s}`)
    const data = await res.json()
    setMode('edit')
    setSlug(s)
    setFields(data.fields)
    setBody(data.body)
    setOgImage(data.ogImage ?? null)
    setOgVersion((v) => v + 1)
    setStatus('')
  }

  const setF = <K extends keyof Fields>(k: K, v: Fields[K]) =>
    setFields((f) => ({ ...f, [k]: v }))

  // One control drives both date fields: `pubDate` is what RSS reads, `date` is
  // the string the page prints. Keeping them in one handler stops them drifting.
  function setPublishedAt(localValue: string) {
    const iso = localInputToIso(localValue)
    if (!iso) return setF('pubDate', '')
    setFields((f) => ({ ...f, pubDate: iso, date: isoToHumanDate(iso) }))
  }

  async function onAudio(file: File) {
    // The drop zone only renders once the episode exists (two-step flow).
    if (mode !== 'edit') return

    // Read duration client-side from an <audio> element.
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const seconds: number = await new Promise((resolve) => {
      audio.onloadedmetadata = () => resolve(audio.duration || 0)
      audio.onerror = () => resolve(0)
      audio.src = url
    })
    URL.revokeObjectURL(url)
    const durationSeconds = Math.round(seconds)
    const duration = fmtDuration(seconds)

    const mb = Math.round(file.size / 1024 / 1024)
    setStatus(`Uploading ${mb}MB to R2 — this can take a few minutes…`)
    const form = new FormData()
    form.append('file', file)
    form.append('duration', duration)
    form.append('durationSeconds', String(durationSeconds))
    const res = await fetch(`/api/studio/podcast/${slug}/audio`, { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) return setStatus(`Audio upload failed: ${data.error}`)
    // The route writes the audio fields to en.mdx and episodes.ts itself. Merge
    // only those fields back, so edits in progress elsewhere on the form aren't
    // clobbered by the on-disk copy.
    const saved: Partial<Fields> = data.fields ?? {}
    setFields((f) => ({
      ...f,
      audioUrl: saved.audioUrl ?? data.audioUrl,
      audioSizeBytes: saved.audioSizeBytes ?? data.audioSizeBytes,
      audioMimeType: saved.audioMimeType ?? f.audioMimeType,
      duration: saved.duration ?? duration,
      durationSeconds: saved.durationSeconds ?? durationSeconds,
    }))
    setStatus('Audio uploaded and saved')
  }

  async function onOgImage(file: File) {
    if (mode !== 'edit') return
    setStatus('Uploading image…')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/studio/podcast/${slug}/og-image`, { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) return setStatus(`Error: ${data.error}`)
    setOgImage(data.filename)
    setOgVersion((v) => v + 1)
    setStatus(`OG image saved (${data.filename})`)
  }

  async function save() {
    if (mode === 'new') {
      const finalSlug = slug || slugify(fields.title)
      if (!finalSlug) return setStatus('Add a title or slug first')
      setStatus('Creating…')
      const res = await fetch('/api/studio/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: finalSlug,
          episodeNumber: fields.episodeNumber,
          title: fields.title,
          description: fields.description,
          date: fields.date,
          pubDate: fields.pubDate,
          hosts: fields.hosts,
          guests: fields.guests,
          duration: fields.duration,
          durationSeconds: fields.durationSeconds,
          audioUrl: fields.audioUrl,
          audioSizeBytes: fields.audioSizeBytes,
          explicit: fields.explicit,
          blueskyPostUrl: fields.blueskyPostUrl,
          body,
          branch: makeBranch && branchName ? { name: branchName } : undefined,
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
      await loadEpisode(data.slug)
      setStatus(
        data.branch?.created
          ? `Created ${data.slug} on ${data.branch.name}`
          : `Created ${data.slug}`,
      )
      await loadGit()
      await refreshList()
    } else {
      setStatus('Saving…')
      const res = await fetch(`/api/studio/podcast/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, body }),
      })
      const data = await res.json()
      if (!res.ok) return setStatus(`Error: ${data.error}`)
      // Smart typography is applied server-side; show the stored strings so the
      // form doesn't keep displaying straight quotes the file no longer has.
      if (data.fields) {
        setFields((f) => ({
          ...f,
          title: data.fields.title,
          description: data.fields.description,
        }))
      }
      setStatus(`Saved ${data.slug}`)
      await refreshList()
    }
  }

  async function remove() {
    if (mode !== 'edit') return
    if (!confirm(`Delete "${fields.title || slug}"? Deletes the episode directory and episodes.ts entry.`)) return

    // Second, separate confirmation: the files are recoverable from git, the
    // object in R2 is not. Whether the URL actually points at our bucket is the
    // server's call — it holds R2_PUBLIC_BASE — so just ask when there's a URL.
    const deleteAudio =
      Boolean(fields.audioUrl) &&
      confirm(
        `Also delete the audio file from storage?\n\n${fields.audioUrl}\n\nThis cannot be undone. Cancel to keep it.`,
      )

    setStatus('Deleting…')
    const res = await fetch(
      `/api/studio/podcast/${slug}${deleteAudio ? '?deleteAudio=true' : ''}`,
      { method: 'DELETE' },
    )
    const data = await res.json()
    if (!res.ok) return setStatus(`Error: ${data.error}`)
    setStatus(data.audioDeleted ? `Deleted ${slug} and its MP3` : `Deleted ${slug}`)
    startNew()
    await refreshList()
  }

  const isError = status.startsWith('Error') || status.includes('failed') || status.startsWith('Could not')
  const input = 'w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-neutral-500'
  const label = 'mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400'

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-72 shrink-0 flex-col border-r border-neutral-200 px-5 py-6">
        <StudioNav active="podcast" />
        <button onClick={startNew} className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:border-neutral-400 hover:bg-neutral-50">
          + New episode
        </button>
        <p className="mt-8 mb-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-neutral-400">Episodes</p>
        <ul className="-mx-2 flex flex-col gap-0.5 overflow-y-auto">
          {episodes.map((e) => {
            const active = mode === 'edit' && e.slug === slug
            return (
              <li key={e.slug}>
                <button
                  onClick={() => loadEpisode(e.slug)}
                  className={'block w-full rounded-md px-2 py-1.5 text-left transition ' + (active ? 'bg-neutral-900/[0.06] text-neutral-900' : 'text-neutral-600 hover:bg-neutral-900/[0.04]')}
                >
                  <span className="block truncate text-sm">{e.title}</span>
                  <span className="mt-0.5 block font-mono text-[0.7rem] text-neutral-400">#{e.episodeNumber}</span>
                </button>
              </li>
            )
          })}
          {episodes.length === 0 && <li className="px-2 py-1.5 text-sm italic text-neutral-400">No episodes yet</li>}
        </ul>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200 bg-white/85 px-8 py-3 backdrop-blur">
          <div className="flex items-baseline gap-3 text-sm">
            <span className="font-semibold tracking-tight">Podcast</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-500">{mode === 'new' ? 'New episode' : 'Editing'}</span>
            {mode === 'edit' && (
              <a href={`/off-protocol/${slug}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-neutral-500 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900">
                /off-protocol/{slug} ↗
              </a>
            )}
            {git && (
              <span className="font-mono text-xs text-neutral-400">on {git.branch}</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {status && <span className={'text-sm ' + (isError ? 'text-red-600' : 'text-neutral-500')} aria-live="polite">{status}</span>}
            {mode === 'edit' && <button onClick={remove} className="text-sm text-neutral-400 hover:text-red-600">Delete</button>}
            {mode === 'edit' && (
              <button onClick={save} className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">Save</button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-8 py-10">
          <input value={fields.title} onChange={(e) => setF('title', e.target.value)} placeholder="Untitled episode" className="w-full bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-neutral-300" />
          <input value={fields.description} onChange={(e) => setF('description', e.target.value)} placeholder="A one- or two-sentence description…" className="mt-3 w-full bg-transparent text-lg text-neutral-600 outline-none placeholder:text-neutral-300" />

          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-neutral-200 pt-6">
            <div><span className={label}>Episode #</span><input type="number" value={fields.episodeNumber} onChange={(e) => setF('episodeNumber', Number(e.target.value))} className={input} /></div>
            <div>
              <span className={label}>Publish date — RSS</span>
              <input type="datetime-local" value={isoToLocalInput(fields.pubDate)} onChange={(e) => setPublishedAt(e.target.value)} className={input + ' font-mono'} />
            </div>
            <div>
              <span className={label}>Display date</span>
              <input value={fields.date} onChange={(e) => setF('date', e.target.value)} className={input} />
              <span className="mt-1 block text-xs italic text-neutral-400">Follows the publish date; edit for custom wording.</span>
            </div>
            <div><span className={label}>Hosts (comma-sep)</span><input value={fields.hosts.join(', ')} onChange={(e) => setF('hosts', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="Jim Ray (show default)" className={input} /></div>
            <div><span className={label}>Guests (comma-sep)</span><input value={fields.guests.join(', ')} onChange={(e) => setF('guests', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} className={input} /></div>
            {mode === 'new' ? (
              <div><span className={label}>Slug (blank = from title)</span><input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={slugify(fields.title) || 'my-episode'} className={input + ' font-mono'} /></div>
            ) : (
              <div><span className={label}>Slug (read-only)</span><div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-sm text-neutral-500">{slug}</div></div>
            )}
            <label className="col-span-2 flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={fields.explicit} onChange={(e) => setF('explicit', e.target.checked)} /> Explicit
            </label>
          </div>

          {mode === 'new' && (
            <div className="mt-6 border-t border-neutral-200 pt-6">
              <p className={label}>Branch</p>
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
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className={input + ' mt-2 font-mono'}
                      />
                      <pre className="mt-2 overflow-x-auto rounded bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-500">
                        git fetch origin main{'\n'}git checkout -b {branchName} origin/main
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
              <button onClick={save} className="rounded-md bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-neutral-700">Create episode</button>
              <span className="text-xs italic text-neutral-400">Audio, show notes, and Open Graph image appear after you create the episode.</span>
            </div>
          )}

          {mode === 'edit' && (
            <>
              <div className="mt-6">
                <p className={label}>Audio (MP3)</p>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onAudio(f) }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 px-4 py-6 text-center hover:border-neutral-400"
                >
                  <span className="text-sm text-neutral-500">{fields.audioUrl ? 'Drop a new MP3 to replace' : 'Drag an MP3 here, or click to choose'}</span>
                  {fields.audioUrl && <span className="mt-1 break-all font-mono text-xs text-neutral-400">{fields.audioUrl}</span>}
                  {fields.duration && <span className="mt-1 font-mono text-xs text-neutral-400">{fields.duration} · {Math.round(fields.audioSizeBytes / 1024 / 1024)}MB</span>}
                  <input type="file" accept="audio/mpeg,.mp3" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onAudio(f); e.target.value = '' }} />
                </label>
              </div>

              <div className="mt-6">
                <p className={label}>Open Graph image</p>
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) onOgImage(f) }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 px-4 py-6 text-center hover:border-neutral-400"
                >
                  {ogImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/studio/podcast/${slug}/og-image?v=${ogVersion}`} alt="OG preview" className="mb-3 max-h-40 rounded border border-neutral-200" />
                  )}
                  <span className="text-sm text-neutral-500">{ogImage ? 'Drop a new image to replace' : 'Drag an image here, or click to choose'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/gif" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onOgImage(f); e.target.value = '' }} />
                </label>
              </div>

              <div className="mt-8">
                <p className={label}>Show notes — MDX</p>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false} placeholder="Write the show notes here…" className="min-h-[20rem] w-full resize-y rounded-lg border border-neutral-300 bg-white p-4 font-mono text-sm leading-7 outline-none focus:border-neutral-500" />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
