/**
 * Optimistic concurrency for the studio's edit flows.
 *
 * The editors load a file into React state once and hold it — there is no
 * revalidation. A save PUTs the whole field set back, so any change made to the
 * file after the form loaded is silently reverted. That is not hypothetical: it
 * reverted episode 14's pubDate in a commit whose own message said it was
 * fixing the pubDate.
 *
 * The fix is a precondition. A read hands back an opaque fingerprint of the file
 * it parsed; a write sends that fingerprint back and is refused if the file has
 * moved on since.
 *
 * Server-side only — imports node:crypto. Clients only ever pass the string
 * through, so they never need to import this.
 */
import { createHash } from 'node:crypto'

// Truncated because this only has to detect "someone else wrote this file", not
// resist an adversary. 16 hex chars is 64 bits.
export function fileRevision(contents: string): string {
  return createHash('sha256').update(contents).digest('hex').slice(0, 16)
}

export class RevisionConflictError extends Error {
  readonly code = 'revision_conflict'
  constructor(message: string) {
    super(message)
    this.name = 'RevisionConflictError'
  }
}

/**
 * Refuse a write whose base revision no longer matches the file on disk.
 *
 * An absent `expected` means the caller sent no precondition — the CLIs and the
 * create flow have nothing to send — and keeps the previous last-write-wins
 * behaviour rather than being rejected.
 */
export function assertRevision(
  expected: string | undefined,
  actual: string,
  what: string,
): void {
  if (!expected) return
  if (expected === actual) return
  throw new RevisionConflictError(
    `${what} changed on disk since you opened it. Reload to see the current version — saving now would overwrite those changes.`,
  )
}
