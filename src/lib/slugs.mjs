/**
 * Slug and date-stamp helpers.
 *
 * MUST STAY FREE OF NODE BUILT-INS. The studio's editors are `'use client'`
 * components and import from here, so anything reachable from this file ends up
 * in the browser bundle — see the note in ./gitNames.mjs for what that costs.
 *
 * Plain JavaScript so the `.mjs` authoring CLIs can share it with the
 * TypeScript studio.
 */

/**
 * Lowercase, hyphen-separated, alphanumerics only.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * `YYYY-MM-DD` in local time, or '' when unparseable.
 *
 * Local rather than UTC so the stamp matches the date the author sees in the
 * publish-date control.
 *
 * @param {string} iso
 * @returns {string}
 */
export function dateStamp(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * The default slug for a new episode: `YYYY-MM-DD-title[-first-guest]`.
 *
 * Matches the naming the show already uses (2026-07-22-erin-kissane). Only the
 * first guest appears — the date and title already identify the episode, and
 * two or three names make the URL unreadable. Any segment that can't be built
 * is dropped rather than left as an empty gap.
 *
 * @param {{ pubDate?: string, title?: string, guests?: string[] }} [input]
 * @returns {string}
 */
export function episodeSlug(input = {}) {
  const { pubDate = '', title = '', guests = [] } = input
  const firstGuest = (guests || []).map((g) => String(g).trim()).filter(Boolean)[0]
  return [dateStamp(pubDate), slugify(title), firstGuest ? slugify(firstGuest) : '']
    .filter(Boolean)
    .join('-')
}
