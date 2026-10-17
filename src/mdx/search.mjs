import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import { toString } from 'mdast-util-to-string'
import * as path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { createLoader } from 'simple-functional-loader'
import { filter } from 'unist-util-filter'
import { SKIP, visit } from 'unist-util-visit'
import * as url from 'url'

import i18nConfig from '../../i18nConfig.js'

const __filename = url.fileURLToPath(import.meta.url)
const processor = remark().use(remarkMdx).use(extractSections)
const slugify = slugifyWithCounter()

function isObjectExpression(node) {
  return (
    node.type === 'mdxTextExpression' &&
    node.data?.estree?.body?.[0]?.expression?.type === 'ObjectExpression'
  )
}

function excludeObjectExpressions(tree) {
  return filter(tree, (node) => !isObjectExpression(node))
}

function getJsxAttr(node, name) {
  let attr = node.attributes?.find((a) => a.name === name)
  if (!attr) return undefined
  // Expression attributes like level={2} have an object value with .value as string
  if (typeof attr.value === 'object' && attr.value?.value != null) {
    return attr.value.value
  }
  return attr.value
}

// Translated pages write section headings as `<Heading level={2} id="...">`
// so they keep the English anchor. On its own line that parses as a flow
// element, but written inline it parses as a paragraph wrapping a text
// element. Returns the JSX node in either case.
function getJsxHeading(node, level) {
  let candidate =
    node.type === 'paragraph' && node.children.length === 1
      ? node.children[0]
      : node
  if (
    (candidate.type === 'mdxJsxFlowElement' ||
      candidate.type === 'mdxJsxTextElement') &&
    candidate.name === 'Heading' &&
    getJsxAttr(candidate, 'level') === String(level)
  ) {
    return candidate
  }
  return null
}

function extractHeaderExport(tree) {
  let headerTitle = null
  let headerDescription = null

  visit(tree, 'mdxjsEsm', (node) => {
    // Look for: export const header = { title: '...', description: '...' }
    const body = node.data?.estree?.body
    if (!body) return

    for (const declaration of body) {
      if (
        declaration.type === 'ExportNamedDeclaration' &&
        declaration.declaration?.type === 'VariableDeclaration'
      ) {
        for (const decl of declaration.declaration.declarations) {
          if (
            decl.id?.name === 'header' &&
            decl.init?.type === 'ObjectExpression'
          ) {
            for (const prop of decl.init.properties) {
              if (prop.key?.name === 'title' && prop.value?.type === 'Literal') {
                headerTitle = prop.value.value
              }
              if (prop.key?.name === 'description' && prop.value?.type === 'Literal') {
                headerDescription = prop.value.value
              }
            }
          }
        }
      }
    }
  })

  return { headerTitle, headerDescription }
}

function extractSections() {
  return (tree, vfile) => {
    slugify.reset()

    const { sections } = vfile
    const { headerTitle, headerDescription } = extractHeaderExport(tree)

    // If we found a header export, use it as the first section
    if (headerTitle) {
      const content = headerDescription ? [headerDescription] : []
      sections.push([headerTitle, null, content])
    }

    // Headings to exclude from search results
    const excludedHeadings = ['Further Reading and Resources']

    visit(tree, (node) => {
      let jsxHeading = getJsxHeading(node, 2)
      if (jsxHeading) {
        let content = toString(excludeObjectExpressions(jsxHeading))
        sections.push([content, getJsxAttr(jsxHeading, 'id') ?? null, []])
        return SKIP
      }
      if (node.type === 'heading' || node.type === 'paragraph') {
        let content = toString(excludeObjectExpressions(node))
        if (node.type === 'heading' && node.depth <= 2) {
          // Skip H1s if we already have a header title (avoid duplication)
          if (node.depth === 1 && headerTitle) {
            return SKIP
          }
          // Skip excluded headings
          if (excludedHeadings.includes(content)) {
            return SKIP
          }
          let hash = node.depth === 1 ? null : slugify(content)
          sections.push([content, hash, []])
        } else {
          sections.at(-1)?.[2].push(content)
        }
        return SKIP
      }
    })
  }
}

/**
 * Splits an MDX page into the `[title, hash, content]` sections that the
 * search index stores.
 */
export function extractSearchSections(mdx) {
  let sections = []
  let vfile = { value: mdx, sections }
  processor.runSync(processor.parse(vfile), vfile)
  return sections
}

export default function Search(nextConfig = {}) {
  let cache = new Map()

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let appDir = path.resolve('./src/app')
            this.addContextDependency(appDir)

            let files = glob.sync('**/*.mdx', { cwd: appDir })
            let data = files.map((file) => {
              let url =
                '/' +
                file.replace('[locale]/', '').replace(/(^|\/)page\.mdx$/, '')
              for (const lang of i18nConfig.locales) {
                if (url.endsWith(`/${lang}.mdx`)) {
                  url = url.replace(`/${lang}.mdx`, '')
                  if (lang !== 'en') {
                    url = `/${lang}${url}`
                  }
                }
              }
              if (!url) url = '/'
              let mdx = fs.readFileSync(path.join(appDir, file), 'utf8')

              let sections

              if (cache.get(file)?.[0] === mdx) {
                sections = cache.get(file)[1]
              } else {
                sections = extractSearchSections(mdx)
                cache.set(file, [mdx, sections])
              }

              return { url, sections }
            })

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                document: {
                  id: 'url',
                  index: [
                    {
                      field: 'title',
                      tokenize: 'forward',
                      resolution: 9,
                    },
                    {
                      field: 'content',
                      tokenize: 'full',
                      resolution: 3,
                    }
                  ],
                  store: ['title', 'pageTitle'],
                },
                context: {
                  resolution: 9,
                  depth: 2,
                  bidirectional: true
                }
              })

              let data = ${JSON.stringify(data)}

              for (let { url, sections } of data) {
                for (let [title, hash, content] of sections) {
                  sectionIndex.add({
                    url: url + (hash ? ('#' + hash) : ''),
                    title,
                    content: content.join('\\n'),
                    pageTitle: hash ? sections[0][0] : undefined,
                  })
                }
              }

              const nonDefaultLocales = ${JSON.stringify(i18nConfig.locales.filter(l => l !== i18nConfig.defaultLocale))}

              export function search(query, options = {}) {
                const { locale, ...searchOptions } = options
                let results = sectionIndex.search(query, {
                  ...searchOptions,
                  enrich: true,
                })

                const seen = new Map()

                for (const fieldResult of results) {
                  const boost = fieldResult.field === 'title' ? 0 : 1000
                  fieldResult.result.forEach((item, idx) => {
                    const id = item.id
                    const urlPath = id.split('#')[0]

                    // Filter by locale if specified
                    if (locale) {
                      if (locale === 'en') {
                        // English: exclude URLs that start with other locale prefixes
                        if (nonDefaultLocales.some(l => urlPath.startsWith('/' + l + '/'))) {
                          return
                        }
                      } else {
                        // Other locales: only include URLs that start with this locale prefix
                        if (!urlPath.startsWith('/' + locale + '/')) {
                          return
                        }
                      }
                    }

                    // Check if this is a blog post and apply penalty
                    const isBlog = urlPath.includes('/blog/')
                    const blogPenalty = isBlog ? 500 : 0

                    const score = boost + idx + blogPenalty

                    if (!seen.has(id) || seen.get(id).score > score) {
                      seen.set(id, {
                        url: id,
                        title: item.doc.title,
                        pageTitle: item.doc.pageTitle,
                        isBlog,
                        score
                      })
                    }
                  })
                }

                return [...seen.values()]
                  .sort((a, b) => a.score - b.score)
                  .map(({ url, title, pageTitle, isBlog }) => ({ url, title, pageTitle, isBlog }))
              }
            `
          }),
        ],
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}