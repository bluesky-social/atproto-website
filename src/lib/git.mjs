/**
 * Git operations for the studio API routes and the authoring CLIs.
 *
 * Plain JavaScript on purpose: the `.mjs` scripts in scripts/ cannot cleanly
 * import a `.ts` module, so this is the one implementation and
 * src/lib/studio/git.ts re-exports it with types. Same arrangement as
 * src/mdx/smartText.mjs.
 *
 * SERVER-SIDE ONLY — this imports node:child_process. Client components must
 * import the pure helpers from ./gitNames.mjs instead; see the note there.
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import {
  parseGitStatus,
  branchNameFor,
  isValidBranchName,
} from './gitNames.mjs'

// Re-exported so server-side callers and the CLIs have a single import site.
export { parseGitStatus, branchNameFor, isValidBranchName }

const execFileAsync = promisify(execFile)

/**
 * Default runner: execFile with an argv array, never a shell.
 *
 * @param {string} command
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function defaultRun(command, args) {
  const { stdout } = await execFileAsync(command, args)
  return stdout
}

/**
 * Run one git command, raising an error that carries git's own message.
 *
 * @param {(command: string, args: string[]) => Promise<string>} run
 * @param {string[]} args
 * @returns {Promise<string>}
 */
async function git(run, args) {
  try {
    return await run('git', args)
  } catch (err) {
    const detail = String(err?.stderr || err?.message || '')
      .trim()
      .split('\n')
      .filter(Boolean)
      .pop()
    throw new Error(`git ${args.join(' ')} failed: ${detail || 'unknown error'}`)
  }
}

/**
 * Current branch, and whether the working tree has uncommitted changes.
 *
 * @param {{ run?: (command: string, args: string[]) => Promise<string> }} [opts]
 * @returns {Promise<{ branch: string, dirty: boolean, files: string[] }>}
 */
export async function gitState(opts = {}) {
  const run = opts.run ?? defaultRun
  const branch = (await git(run, ['branch', '--show-current'])).trim()
  const porcelain = await git(run, ['status', '--porcelain'])
  return { branch, ...parseGitStatus(porcelain) }
}

/**
 * Create `name` from `origin/main`, fetching first.
 *
 * Refuses invalid names before running anything. A failed fetch aborts rather
 * than branching from a possibly stale local ref.
 *
 * @param {string} name
 * @param {{ run?: (command: string, args: string[]) => Promise<string> }} [opts]
 * @returns {Promise<{ name: string }>}
 */
export async function createBranch(name, opts = {}) {
  const run = opts.run ?? defaultRun
  if (!isValidBranchName(name)) {
    throw new Error(`Invalid branch name: ${JSON.stringify(name)}`)
  }
  await git(run, ['fetch', 'origin', 'main'])
  await git(run, ['checkout', '-b', name, 'origin/main'])
  return { name }
}
