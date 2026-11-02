import { type SearchOptions } from 'flexsearch'

declare module '@/mdx/search.mjs' {
  export type Result = {
    url: string
    title: string
    pageTitle?: string
    isBlog?: boolean
  }

  export type LocalizedSearchOptions = SearchOptions & {
    locale?: string
    blogsOnly?: boolean
    distinctPosts?: boolean
  }

  export function search(
    query: string,
    options?: LocalizedSearchOptions,
  ): Array<Result>
}
