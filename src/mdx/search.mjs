import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import { toString } from 'mdast-util-to-string'
import { mdxAnnotations } from 'mdx-annotations'
import * as path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { createLoader } from 'simple-functional-loader'
import { filter } from 'unist-util-filter'
import { SKIP, visit } from 'unist-util-visit'
import * as url from 'url'

import i18nConfig from '../../i18nConfig.js'
import { normalizeBlogTags } from '../lib/blogTags.mjs'
import { remarkTranslatedHeadingIds } from './headingIds.mjs'

const __filename = url.fileURLToPath(import.meta.url)
const processor = remark()
  .use(remarkMdx)
  .use(mdxAnnotations.remark)
  .use(remarkTranslatedHeadingIds)
  .use(extractSections)
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
  let headerTags = []
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
              if (prop.key?.name === 'tags') {
                if (prop.value?.type !== 'ArrayExpression')
                  throw new Error('Tags must be a literal array')
                headerTags = normalizeBlogTags(
                  prop.value.elements.map((e) => {
                    if (e?.type !== 'Literal')
                      throw new Error('Tags must contain strings')
                    return e.value
                  }),
                )
              }
              if (
                prop.key?.name === 'title' &&
                prop.value?.type === 'Literal'
              ) {
                headerTitle = prop.value.value
              }
              if (
                prop.key?.name === 'description' &&
                prop.value?.type === 'Literal'
              ) {
                headerDescription = prop.value.value
              }
            }
          }
        }
      }
    }
  })

  return { headerTitle, headerDescription, headerTags }
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
          let hash =
            node.depth === 1
              ? null
              : (node.data?.hProperties?.id ?? slugify(content))
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
 * search index stores. `file` is the page's path, used to resolve anchors for
 * translated pages.
 */
export function extractSearchSections(mdx, file) {
  let sections = []
  let vfile = { value: mdx, path: file, sections }
  processor.runSync(processor.parse(vfile), vfile)
  return sections
}

export function extractBlogTags(mdx) {
  return extractHeaderExport(processor.parse(mdx)).headerTags
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
                sections = extractSearchSections(mdx, path.join(appDir, file))
                cache.set(file, [mdx, sections])
              }

              // Tags belong to the post, shared by every translation.
              const isBlog = file.startsWith('[locale]/blog/')
              let tags = []
              if (isBlog) {
                const canonical = path.join(
                  appDir,
                  path.dirname(file),
                  'en.mdx',
                )
                this.addDependency(canonical)
                tags = extractBlogTags(fs.readFileSync(canonical, 'utf8'))
              }
              return { url, sections, tags }
            })

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import { createSearch } from '@/lib/blogSearch.mjs'
              export const search = createSearch(${JSON.stringify(data)}, ${JSON.stringify(i18nConfig.locales.filter((l) => l !== i18nConfig.defaultLocale))})
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
