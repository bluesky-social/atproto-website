import FlexSearch from 'flexsearch'
import { parseBlogQuery } from './blogTags.mjs'

// Shared by the sitewide dialog and the blog listing. Retrieve candidates before
// applying locale/topic filters, then limit: filtering a short list loses hits.
export function createSearch(data, nonDefaultLocales = ['pt', 'ja', 'ko']) {
  const index = new FlexSearch.Document({
    document: {
      id: 'url',
      index: [
        { field: 'title', tokenize: 'forward', resolution: 9 },
        { field: 'content', tokenize: 'full', resolution: 3 },
      ],
      store: ['title', 'pageTitle'],
    },
    context: { resolution: 9, depth: 2, bidirectional: true },
  })
  const pages = new Map()
  let sectionCount = 0
  for (const page of data) {
    pages.set(page.url, page)
    for (const [title, hash, content] of page.sections) {
      index.add({
        url: page.url + (hash ? `#${hash}` : ''),
        title,
        content: content.join('\n'),
        pageTitle: hash ? page.sections[0][0] : undefined,
      })
      sectionCount++
    }
  }

  /** @returns {{url: string, title: string, pageTitle?: string, isBlog: boolean}[]} */
  return function search(query, options = {}) {
    const {
      locale,
      blogsOnly = false,
      distinctPosts = false,
      limit = 100,
      ...searchOptions
    } = options
    const { text, tags } = parseBlogQuery(query)
    const eligible = (page) => {
      if (!page) return false
      const isBlog = page.url.includes('/blog/')
      if ((blogsOnly || tags.length) && !isBlog) return false
      if (!tags.every((tag) => (page.tags ?? []).includes(tag))) return false
      if (
        locale === 'en' &&
        nonDefaultLocales.some((l) => page.url.startsWith(`/${l}/`))
      )
        return false
      if (locale && locale !== 'en' && !page.url.startsWith(`/${locale}/`)) {
        // Blog routes fall back to English. Prefer an actual translation when
        // indexed, otherwise retain the canonical post in localized searches.
        if (
          !isBlog ||
          !page.url.startsWith('/blog/') ||
          pages.has(`/${locale}${page.url}`)
        )
          return false
      }
      return true
    }
    const localizedUrl = (url) =>
      locale && locale !== 'en' && url.startsWith('/blog/')
        ? `/${locale}${url}`
        : url
    if (!text) {
      if (!tags.length && !blogsOnly) return []
      return data
        .filter(eligible)
        .slice(0, limit)
        .map((page) => ({
          url: localizedUrl(page.url),
          title: page.sections[0]?.[0] ?? page.url,
          isBlog: true,
        }))
    }
    const results = index.search(text, {
      ...searchOptions,
      limit: Math.max(sectionCount, 1),
      enrich: true,
    })
    const seen = new Map()
    for (const field of results) {
      field.result.forEach((item, position) => {
        const pageUrl = item.id.split('#')[0]
        const page = pages.get(pageUrl)
        if (!eligible(page)) return
        const isBlog = pageUrl.includes('/blog/')
        const score =
          (field.field === 'title' ? 0 : 1000) + position + (isBlog ? 500 : 0)
        const id = distinctPosts && isBlog ? pageUrl : item.id
        if (!seen.has(id) || seen.get(id).score > score) {
          seen.set(id, {
            url: localizedUrl(id),
            title:
              distinctPosts && isBlog ? page.sections[0][0] : item.doc.title,
            pageTitle: distinctPosts ? undefined : item.doc.pageTitle,
            isBlog,
            score,
          })
        }
      })
    }
    return [...seen.values()]
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map(({ score, ...result }) => result)
  }
}
