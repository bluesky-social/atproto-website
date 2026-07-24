export type AuthorMap = Record<string, string>

export function resolveAuthorDid(authors: AuthorMap, name: string): string | null {
  return authors[name] ?? null
}

export function withAuthor(
  authors: AuthorMap,
  name: string,
  did: string,
): AuthorMap {
  return { ...authors, [name]: did }
}
