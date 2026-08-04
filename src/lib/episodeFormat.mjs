/**
 * Episode format vocabulary — what kind of thing an episode is.
 *
 * MUST STAY FREE OF NODE BUILT-INS. The studio's episode editor is a
 * `'use client'` component and imports from here, so anything reachable from
 * this file ends up in the browser bundle — see the note in ./gitNames.mjs for
 * what that costs.
 *
 * Plain JavaScript so `scripts/new-episode.mjs` can share it with the
 * TypeScript studio and the listing page, the same way ./slugs.mjs does.
 */

/** @typedef {'conversation' | 'livestream' | 'ama'} EpisodeFormat */

/**
 * Display order for the editor's <select> and the CLI prompt.
 *
 * The union above is written by hand rather than derived from this array,
 * because `as const` is not valid JavaScript. A test pins the two together.
 *
 * @type {readonly EpisodeFormat[]}
 */
export const EPISODE_FORMATS = ['conversation', 'livestream', 'ama']

/**
 * Badge and option text. Typed as a total Record so a new format without a
 * label is a compile error rather than an `undefined` badge.
 *
 * @type {Record<EpisodeFormat, string>}
 */
export const FORMAT_LABELS = {
  conversation: 'Conversation',
  // "Recorded Live", not "Livestream": what's published is a recording of a
  // stream, not a stream. The stored value stays `livestream`.
  livestream: 'Recorded Live',
  ama: 'AMA',
}

/** @type {EpisodeFormat} */
export const DEFAULT_EPISODE_FORMAT = 'conversation'

/**
 * Normalize a value read from an MDX header or typed at a prompt.
 *
 * Exact match only — anything unrecognized, including absent and differing
 * case, becomes the default. This is the boundary where files written by
 * humans are tolerated; `Episode.format` in src/lib/episodes.ts is where tsc
 * is strict instead.
 *
 * @param {string} raw
 * @returns {EpisodeFormat}
 */
export function toEpisodeFormat(raw) {
  return EPISODE_FORMATS.includes(raw) ? raw : DEFAULT_EPISODE_FORMAT
}

/**
 * Token used in an episode's R2 folder name when it has no guest to be named
 * after: `off-protocol/<YYYY-MM-DD>-<token>/`.
 *
 * 'live' rather than 'livestream' because the bucket already contains
 * 2026-07-08-live, 2026-06-10-live and 2026-05-29-live — this keeps new uploads
 * consistent with the ones made by hand.
 *
 * @type {Record<EpisodeFormat, string>}
 */
export const FORMAT_DIR_TOKENS = {
  conversation: 'conversation',
  livestream: 'live',
  ama: 'ama',
}

/** @typedef {EpisodeFormat | 'all'} FormatFilter */

/**
 * Reading order for the listing's filter. Deliberately not EPISODE_FORMATS
 * order: that one drives the editor's <select> and is the storage vocabulary,
 * while this is how the filter reads on the page.
 *
 * @type {readonly FormatFilter[]}
 */
export const FILTER_ORDER = ['all', 'livestream', 'ama', 'conversation']

/**
 * Plural, because each filter names a set of episodes rather than one episode's
 * kind — so they read differently from FORMAT_LABELS on purpose.
 *
 * @type {Record<FormatFilter, string>}
 */
export const FILTER_LABELS = {
  all: 'All Episodes',
  livestream: 'Live Recordings',
  ama: 'AMAs',
  conversation: 'Conversations',
}

/**
 * Normalize a `?show=` query value.
 *
 * Unknown values fall back to 'all' rather than to an empty list: a typo or a
 * stale bookmark should show the whole catalogue, not an apparently empty show.
 *
 * @param {string | undefined | null} raw
 * @returns {FormatFilter}
 */
export function toFormatFilter(raw) {
  return raw && EPISODE_FORMATS.includes(raw) ? raw : 'all'
}
