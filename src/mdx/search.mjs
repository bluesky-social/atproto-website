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

    visit(tree, (node) => {
      if (node.type === 'heading' || node.type === 'paragraph') {
        let content = toString(excludeObjectExpressions(node))
        if (node.type === 'heading' && node.depth <= 2) {
          // Skip H1s if we already have a header title (avoid duplication)
          if (node.depth === 1 && headerTitle) {
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

              let sections = []

              if (cache.get(file)?.[0] === mdx) {
                sections = cache.get(file)[1]
              } else {
                let vfile = { value: mdx, sections }
                processor.runSync(processor.parse(vfile), vfile)
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

              export function search(query, options = {}) {
                let results = sectionIndex.search(query, {
                  ...options,
                  enrich: true,
                })

                const seen = new Map()

                for (const fieldResult of results) {
                  const boost = fieldResult.field === 'title' ? 0 : 1000
                  fieldResult.result.forEach((item, idx) => {
                    const id = item.id
                    if (!seen.has(id) || seen.get(id).score > boost + idx) {
                      seen.set(id, {
                        url: id,
                        title: item.doc.title,
                        pageTitle: item.doc.pageTitle,
                        score: boost + idx
                      })
                    }
                  })
                }

                return [...seen.values()]
                  .sort((a, b) => a.score - b.score)
                  .map(({ url, title, pageTitle }) => ({ url, title, pageTitle }))
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