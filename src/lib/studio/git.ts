import {
  gitState,
  createBranch,
  branchNameFor,
  isValidBranchName,
  parseGitStatus,
} from '@/lib/git.mjs'

// The implementation lives in src/lib/git.mjs so the .mjs authoring CLIs can
// import it too — see that file for why.
export { gitState, createBranch, branchNameFor, isValidBranchName, parseGitStatus }

export type GitState = {
  branch: string
  dirty: boolean
  files: string[]
}
