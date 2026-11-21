'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import clsx from 'clsx'

const DEFAULT_DID = 'did:plc:4v4y5r3lwsbtmsxhile2ljac'

type LexiconProperty = {
  name: string
  type: string
  description?: string
  required: boolean
  format?: string
  maxLength?: number
  maxGraphemes?: number
  ref?: string
  refs?: string[]
  items?: {
    type?: string
    ref?: string
    format?: string
    maxLength?: number
    maxGraphemes?: number
  }
}

type LexiconData = {
  id: string
  description?: string
  properties: LexiconProperty[]
}

const cache = new Map<string, LexiconData>()

async function resolvePds(did: string): Promise<string> {
  const res = await fetch(`https://plc.directory/${did}`)
  if (!res.ok) throw new Error('Failed to resolve DID')
  const doc = await res.json()
  const service = doc.service?.find(
    (s: any) => s.type === 'AtprotoPersonalDataServer',
  )
  if (!service) throw new Error('No PDS found for DID')
  return service.serviceEndpoint
}

async function fetchLexicon(
  nsid: string,
  did: string,
): Promise<LexiconData> {
  const key = `${did}/${nsid}`
  if (cache.has(key)) return cache.get(key)!

  const pds = await resolvePds(did)
  const url = `${pds}/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=com.atproto.lexicon.schema&rkey=${encodeURIComponent(nsid)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch lexicon: ${res.status}`)
  const json = await res.json()

  const value = json.value
  const mainDef = value.defs?.main
  if (!mainDef) throw new Error('No main definition found')

  const record = mainDef.type === 'record' ? mainDef.record : mainDef
  const props = record?.properties ?? {}
  const required: string[] = record?.required ?? []

  const properties: LexiconProperty[] = Object.entries(props).map(
    ([name, prop]: [string, any]) => ({
      name,
      type: prop.type,
      description: prop.description,
      required: required.includes(name),
      format: prop.format,
      maxLength: prop.maxLength,
      maxGraphemes: prop.maxGraphemes,
      ref: prop.ref,
      refs: prop.refs,
      items: prop.items,
    }),
  )

  // Sort: required first, then alphabetical
  properties.sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  const data: LexiconData = {
    id: value.id ?? nsid,
    description: mainDef.description,
    properties,
  }
  cache.set(key, data)
  return data
}

function formatType(prop: LexiconProperty): string {
  if (prop.type === 'ref' && prop.ref) {
    return prop.ref.startsWith('#') ? prop.ref.slice(1) : prop.ref
  }
  if (prop.type === 'union' && prop.refs) {
    return `union of ${prop.refs.length} types`
  }
  if (prop.type === 'array' && prop.items) {
    if (prop.items.ref) {
      const ref = prop.items.ref.startsWith('#')
        ? prop.items.ref.slice(1)
        : prop.items.ref
      return `${ref}[]`
    }
    let itemType = prop.items.type ?? 'unknown'
    if (prop.items.format) itemType += ` (${prop.items.format})`
    return `${itemType}[]`
  }
  let t = prop.type
  if (prop.format) t += ` (${prop.format})`
  return t
}

function formatConstraints(prop: LexiconProperty): string | null {
  const parts: string[] = []
  const target = prop.type === 'array' ? prop.items : prop
  if (target?.maxLength !== undefined) parts.push(`max: ${target.maxLength}`)
  if ((target as any)?.maxGraphemes !== undefined)
    parts.push(`max graphemes: ${(target as any).maxGraphemes}`)
  if (prop.type === 'array' && prop.maxLength !== undefined)
    parts.push(`max items: ${prop.maxLength}`)
  return parts.length > 0 ? parts.join(', ') : null
}

export function LexiconHoverCard({
  nsid,
  did = DEFAULT_DID,
  children,
}: {
  nsid: string
  did?: string
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  const [data, setData] = useState<LexiconData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<'below' | 'above'>('below')
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const hasFetched = useRef(false)

  const cancelHide = useCallback(() => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current)
      hideTimeout.current = null
    }
  }, [])

  const scheduleHide = useCallback(() => {
    cancelHide()
    hideTimeout.current = setTimeout(() => setShow(false), 200)
  }, [cancelHide])

  const handleMouseEnter = useCallback(async () => {
    cancelHide()
    setShow(true)

    // Calculate position
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosition(spaceBelow < 350 ? 'above' : 'below')
    }

    if (hasFetched.current) return
    hasFetched.current = true
    setLoading(true)
    try {
      const result = await fetchLexicon(nsid, did)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [nsid, did, cancelHide])

  useEffect(() => {
    return () => cancelHide()
  }, [cancelHide])

  return (
    <span className="relative inline-block">
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={scheduleHide}
        className="cursor-help border-b border-dashed border-blue-400 dark:border-blue-500"
      >
        {children}
      </span>
      {show && (
        <div
          ref={popoverRef}
          onMouseEnter={cancelHide}
          onMouseLeave={scheduleHide}
          className={clsx(
            'absolute left-0 z-50 w-[28rem] rounded-lg border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900',
            position === 'below' ? 'top-full mt-2' : 'bottom-full mb-2',
          )}
        >
          {/* Header */}
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <code className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {data?.id ?? nsid}
            </code>
            {data?.description && (
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {data.description}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto px-4 py-3">
            {loading && (
              <div className="flex items-center gap-2 py-4 text-sm text-zinc-500">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading lexicon...
              </div>
            )}
            {error && (
              <p className="py-4 text-sm text-red-500">
                {error}
              </p>
            )}
            {data && (
              <ul className="m-0 list-none divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
                {data.properties.map((prop) => (
                  <li key={prop.name} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <code className="text-sm text-zinc-900 dark:text-zinc-100">
                        {prop.name}
                      </code>
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                        {formatType(prop)}
                      </span>
                      {prop.required && (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          required
                        </span>
                      )}
                    </div>
                    {prop.description && (
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {prop.description}
                      </p>
                    )}
                    {formatConstraints(prop) && (
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
                        {formatConstraints(prop)}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </span>
  )
}
