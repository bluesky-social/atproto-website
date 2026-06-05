// public/off-protocol/event-utils.mjs
//
// Pure, DOM-free logic behind the <off-protocol-next> widget. Kept separate
// from widget.mjs so it can be unit-tested with `node --test`. The browser
// loads this via a native ESM import from widget.mjs — no bundler involved.

const CANCELLED = 'community.lexicon.calendar.event#cancelled'
const DEFAULT_MARKER = 'https://atproto.com/off-protocol'

/**
 * Compare two URLs by host + path only, tolerant of scheme and a trailing
 * slash. Used to spot the "this is an Off Protocol stream" marker link.
 */
export function sameUrlTarget(a, b) {
  try {
    const ua = new URL(a)
    const ub = new URL(b)
    const path = (u) => u.pathname.replace(/\/+$/, '')
    return ua.host === ub.host && path(ua) === path(ub)
  } catch {
    return false
  }
}

/**
 * From a newest-first list of listRecords entries, choose the event to show:
 * the most recently created record that carries the marker link and is not
 * cancelled — but only if it hasn't ended yet. Returns the entry or null.
 */
export function selectNextEvent(records, nowMs, markerUrl = DEFAULT_MARKER) {
  const matches = (records || []).filter((rec) => {
    const value = rec?.value || {}
    if (value.status === CANCELLED) return false
    return (value.uris || []).some((u) => u?.uri && sameUrlTarget(u.uri, markerUrl))
  })

  const latest = matches[0]
  if (!latest) return null

  const end = Date.parse(latest.value.endsAt || latest.value.startsAt)
  if (!Number.isFinite(end) || nowMs > end) return null
  return latest
}

/**
 * Format an ISO timestamp in the given display timezone, with a GMT
 * parenthetical for readers elsewhere, e.g.
 * "June 10, 2026 · 1:00 PM EDT (5:00 PM GMT)". The widget passes the viewer's
 * resolved local timezone as `timeZone`.
 */
export function formatEventDateTime(iso, timeZone) {
  const d = new Date(iso)
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
  const local = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(d)
  const gmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
  return `${date} · ${local} (${gmt} GMT)`
}

/**
 * Humanize a remaining-time delta. Returns null at or past zero so the caller
 * can flip to a "happening now" state.
 *   formatCountdown(363240000) → "4d 02h 14m"
 *   formatCountdown(8045000)   → "2h 14m 05s"
 */
export function formatCountdown(deltaMs) {
  if (deltaMs <= 0) return null
  const total = Math.floor(deltaMs / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`
  if (m > 0) return `${m}m ${pad(s)}s`
  return `${s}s`
}

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The countdown label to display, or null when no countdown should show.
 * We only surface a countdown inside the final 24 hours — further out, the
 * formatted date alone carries the timing without a clinical ticking clock.
 * Also null at/after zero so the caller can switch to a "happening now" state.
 */
export function countdownText(deltaMs) {
  if (deltaMs <= 0 || deltaMs > DAY_MS) return null
  return `Starts in ${formatCountdown(deltaMs)}`
}

/**
 * Find the stream.place "watch" link in an event's uris array.
 */
export function pickStreamUrl(uris) {
  const found = (uris || []).find((u) => {
    try {
      return new URL(u.uri).host === 'stream.place'
    } catch {
      return false
    }
  })
  return found ? found.uri : null
}

/**
 * Extract the record key (rkey) from an at:// URI.
 */
export function rkeyFromUri(atUri) {
  return atUri.split('/').pop()
}

/**
 * Build the off-platform RSVP/event links from a DID and rkey.
 */
export function buildEventLinks(did, rkey) {
  return {
    smokeSignal: `https://smokesignal.events/${did}/${rkey}`,
    atmoRsvp: `https://atmo.rsvp/p/${did}/e/${rkey}`,
  }
}

/**
 * Read the atproto PDS service endpoint out of a DID document.
 */
export function pdsEndpoint(didDoc) {
  const svc = (didDoc?.service || []).find(
    (s) => s.type === 'AtprotoPersonalDataServer',
  )
  return svc ? svc.serviceEndpoint : null
}
