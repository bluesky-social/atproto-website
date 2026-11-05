import { normalizeBlogTags } from '../../src/lib/blogTags.mjs'

// A missing first-page match does not imply a document is new. Stop only when
// found or when the repository has no more pages.
export async function findDocumentByPath(client, schema, path) {
  let cursor
  do {
    const page = await client.list(schema, {
      limit: 100,
      ...(cursor ? { cursor } : {}),
    })
    const match = page.records.find((record) => record.value.path === path)
    if (match) return match
    cursor = page.cursor
  } while (cursor)
  return undefined
}

// Publishing should not silently repair hand edits by overwriting another
// metadata source. Refuse inconsistent data before authenticating or writing.
export function assertListingTags(slug, tags, posts) {
  const post = posts.find((post) => post.slug === slug)
  if (!post) throw new Error(`Post ${slug} is missing from src/lib/posts.ts`)
  const listingTags = normalizeBlogTags(post.tags).sort()
  const headerTags = normalizeBlogTags(tags).sort()
  if (JSON.stringify(listingTags) !== JSON.stringify(headerTags)) {
    throw new Error(
      `Tags for ${slug} differ between en.mdx and src/lib/posts.ts. Update both before publishing.`,
    )
  }
}
