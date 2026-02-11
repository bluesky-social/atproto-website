import { type SearchOptions } from 'flexsearch'

declare module '@/mdx/search.mjs' {
  export type Result = {
    url: string
    title: string
    pageTitle?: string
  }

  export type LocalizedSearchOptions = SearchOptions & {
    locale?: string
  }

  export function search(query: string, options?: LocalizedSearchOptions): Array<Result>
}
