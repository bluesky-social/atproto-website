/**
 * Conversions between the two date shapes an episode carries: `pubDate` (ISO
 * 8601, what RSS reads) and `date` (the long US string the page displays).
 * Both are derived from one control in the studio so they can't drift.
 */

function parse(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const pad = (n: number) => String(n).padStart(2, '0')

/** ISO string → `YYYY-MM-DDTHH:MM` in local time, for `<input type="datetime-local">`. */
export function isoToLocalInput(iso: string): string {
  const d = parse(iso)
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** `YYYY-MM-DDTHH:MM` in local time → ISO string. */
export function localInputToIso(local: string): string {
  const d = parse(local)
  return d ? d.toISOString() : ''
}

/** ISO string → `YYYY-MM-DD` in local time, for R2 object keys. */
export function isoToDateStamp(iso: string): string {
  const d = parse(iso)
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** ISO string → "July 10, 2026", matching what the CLI writes into `date`. */
export function isoToHumanDate(iso: string): string {
  const d = parse(iso)
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
