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

const sameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * True when `date` names a specific calendar day that isn't the one `pubDate`
 * falls on — i.e. the page and the RSS feed would advertise different days.
 *
 * The display date is deliberately free text ("edit for custom wording"), so
 * this only speaks up when it actually commits to a day: a standalone one- or
 * two-digit number. "August 2026" and "Summer 2026" name no day and are left
 * alone; "August 3, 2026" does, and is checked.
 *
 * Episode 14 shipped with date "August 3, 2026" against a July 31 pubDate, and
 * nothing anywhere said so.
 */
export function dateDivergesFromPubDate(date: string, pubDate: string): boolean {
  const pub = parse(pubDate)
  if (!pub) return false
  if (!/\b\d{1,2}\b/.test(date)) return false
  const shown = parse(date)
  if (!shown) return false
  return !sameLocalDay(shown, pub)
}
