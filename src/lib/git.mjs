/**
 * Git helpers shared by the studio API routes and the authoring CLIs.
 *
 * Plain JavaScript on purpose: the `.mjs` scripts in scripts/ cannot cleanly
 * import a `.ts` module, so this is the one implementation and
 * src/lib/studio/git.ts re-exports it with types. Same arrangement as
 * src/mdx/smartText.mjs.
 */

/**
 * `YYYY-MM-DD` in local time, or '' when unparseable.
 *
 * Duplicates isoToDateStamp in src/lib/studio/episodeDates.ts, which is
 * TypeScript and therefore not importable here. Five lines is a better trade
 * than restructuring tested code to cross the language boundary.
 *
 * @param {string} iso
 * @returns {string}
 */
function dateStamp(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Parse `git status --porcelain` output.
 *
 * Any output at all means dirty, untracked files included: a stray file travels
 * to the new branch and can end up in the post's PR.
 *
 * @param {string} porcelain
 * @returns {{ dirty: boolean, files: string[] }}
 */
export function parseGitStatus(porcelain) {
  const files = []
  for (const raw of String(porcelain).split('\n')) {
    if (!raw.trim()) continue
    // Porcelain v1: two status characters, a space, then the path.
    const path = raw.slice(3)
    // Renames read `old -> new`; report the destination.
    const arrow = path.indexOf(' -> ')
    files.push(arrow === -1 ? path : path.slice(arrow + 4))
  }
  return { dirty: files.length > 0, files }
}

/**
 * The default branch name for new content, matching names already in use in
 * this repo: `blog-<slug>` and `off-protocol-<YYYY-MM-DD>`.
 *
 * @param {'blog' | 'podcast'} kind
 * @param {{ slug?: string, pubDate?: string }} [opts]
 * @returns {string}
 */
export function branchNameFor(kind, opts = {}) {
  const { slug = '', pubDate = '' } = opts
  if (kind === 'podcast') {
    const stamp = dateStamp(pubDate)
    return stamp ? `off-protocol-${stamp}` : `off-protocol-${slug}`
  }
  return `blog-${slug}`
}

/**
 * Whether a string is safe to pass to `git checkout -b`.
 *
 * The name comes from a browser form. It is also passed via execFile with an
 * argv array, so this is defence in depth rather than the only guard.
 *
 * @param {unknown} name
 * @returns {boolean}
 */
export function isValidBranchName(name) {
  if (typeof name !== 'string' || name === '') return false
  if (/\s/.test(name)) return false
  if (/[~^:?*[\\]/.test(name)) return false
  if (name.includes('..') || name.includes('@{')) return false
  if (/^[-/.]/.test(name)) return false
  if (/[/.]$/.test(name) || name.endsWith('.lock')) return false
  return true
}
