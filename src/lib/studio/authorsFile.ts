import * as fs from 'node:fs/promises'
import { mergeAuthorDids, type AuthorMap } from './authors'

/**
 * Merge form-supplied name → DID pairs into authors.json.
 *
 * **Never throws.** By the time this runs, the post or episode is already on
 * disk, and losing written content over a byline link would be a bad trade — so
 * every failure comes back as a warning string for the caller to surface. That
 * matches the contract createPost already had: it returns once content is
 * written, and anything after that is best-effort.
 *
 * Returns null when there was nothing to do or everything worked. The message is
 * phrased to read after "Episode saved, but …".
 */
/**
 * The stored name → DID map, or an empty map if it can't be read.
 *
 * Sent to the editors so they can tell which names have no DID yet. An
 * unreadable file yields `{}` rather than throwing: the consequence is that
 * every name looks unknown, which is a harmless prompt, whereas failing the
 * request would stop the author listing loading at all.
 */
export async function readAuthors(authorsFile: string): Promise<AuthorMap> {
  try {
    return JSON.parse(await fs.readFile(authorsFile, 'utf-8'))
  } catch {
    return {}
  }
}

export async function applyAuthorDids(
  authorsFile: string,
  dids: Record<string, string> | undefined,
): Promise<string | null> {
  if (!dids || Object.keys(dids).length === 0) return null

  try {
    const authors: AuthorMap = JSON.parse(await fs.readFile(authorsFile, 'utf-8'))
    const { map, rejected, changed } = mergeAuthorDids(authors, dids)

    // Write the valid ones even when others were rejected — a typo in one field
    // shouldn't discard a DID that was entered correctly beside it.
    if (changed) {
      await fs.writeFile(authorsFile, JSON.stringify(map, null, 2) + '\n')
    }

    if (rejected.length) {
      const names = rejected.join(', ')
      return `that isn't a valid DID for ${names}, so ${
        rejected.length === 1 ? 'the name was' : 'those names were'
      } left out of authors.json.`
    }
    return null
  } catch (err) {
    return `authors.json could not be updated: ${(err as Error).message}`
  }
}
