// scripts/lib/buildContributors.mjs

/**
 * Maps a blog post's `author` header string to a `contributors[]` array
 * for site.standard.document records.
 *
 * Throws if the name has no entry in `authors`. The migration script
 * and publish-post.mjs both rely on this fail-loud behavior so a stray
 * author name can't quietly produce contributor-less records.
 */
export function buildContributors(authorName, authors) {
  const did = authors[authorName]
  if (!did) {
    throw new Error(
      `Unknown author: ${authorName}. Add an entry to src/lib/authors.json.`,
    )
  }
  return [{ did, displayName: authorName, role: 'author' }]
}
