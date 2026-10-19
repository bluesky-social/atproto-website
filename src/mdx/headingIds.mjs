import { slugifyWithCounter } from '@sindresorhus/slugify'
import * as acorn from 'acorn'
import * as fs from 'fs'
import { toString } from 'mdast-util-to-string'
import { mdxAnnotations } from 'mdx-annotations'
import * as path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'

import i18nConfig from '../../i18nConfig.js'

// Translated pages (`ja.mdx`, `ko.mdx`, ...) should share anchors with their
// English sibling (`en.mdx`), so `#migrating-data` works in every locale and
// translators never need to think about ids. Heading text in non-Latin
// scripts also slugifies to an empty string, so we can't derive anchors from
// it.
//
// Each h2/h3 in a translated page gets its id from, in order:
//   1. An explicit annotation: `## データ移行 {{ id: 'migrating-data' }}`
//   2. The English heading at the same position, if the page has the same
//      number of headings at that level as the English page
//   3. A slug of its own text, or `section-<level>-<n>` if that slug is empty
//
// A translation that has drifted from the English page (missing or extra
// sections) quietly falls back to 3. Add annotations to fix up its anchors.

const parser = remark().use(remarkMdx).use(mdxAnnotations.remark)
const englishAnchorCache = new Map()

function isSectionHeading(node) {
  return node.type === 'heading' && (node.depth === 2 || node.depth === 3)
}

function getAnnotationId(node) {
  let annotation = node.data?.hProperties?.annotation
  if (!annotation) return null
  try {
    let expression = acorn.parse(`(${annotation.trim()})`, {
      ecmaVersion: 'latest',
    }).body[0].expression
    let id = expression.properties?.find(
      (prop) => (prop.key?.name ?? prop.key?.value) === 'id',
    )
    return typeof id?.value.value === 'string' ? id.value.value : null
  } catch {
    return null
  }
}

function setId(node, id) {
  let data = node.data || (node.data = {})
  let props = data.hProperties || (data.hProperties = {})
  props.id = id
}

function getHeadingLevels(tree) {
  let headings = []
  visit(tree, (node) => {
    if (isSectionHeading(node)) headings.push(node)
  })
  return headings
}

// Mirrors `rehypeSlugify` in rehype.mjs: one counter shared by h2s and h3s.
function getEnglishAnchors(englishFile) {
  let mdx = fs.readFileSync(englishFile, 'utf8')
  let cached = englishAnchorCache.get(englishFile)
  if (cached?.mdx === mdx) return cached.anchors

  let slugify = slugifyWithCounter()
  let anchors = getHeadingLevels(parser.runSync(parser.parse(mdx))).map(
    (node) => ({
      depth: node.depth,
      id: getAnnotationId(node) ?? slugify(toString(node)),
    }),
  )
  englishAnchorCache.set(englishFile, { mdx, anchors })
  return anchors
}

function getEnglishFile(file) {
  let { dir, name, ext } = path.parse(file)
  if (ext !== '.mdx' || name === 'en' || !i18nConfig.locales.includes(name)) {
    return null
  }
  let englishFile = path.join(dir, 'en.mdx')
  return fs.existsSync(englishFile) ? englishFile : null
}

/**
 * Sets `data.hProperties.id` on every h2 and h3 in a translated page. Pages
 * that aren't translations are left alone and slugified as usual.
 */
export function assignTranslatedHeadingIds(tree, file) {
  let englishFile = file && getEnglishFile(file)
  if (!englishFile) return

  let headings = getHeadingLevels(tree)
  let english = getEnglishAnchors(englishFile)
  let slugify = slugifyWithCounter()

  // h2s and h3s are matched separately, so a translation that skipped one
  // subsection still gets English anchors for its top-level sections.
  for (let depth of [2, 3]) {
    let translated = headings.filter((node) => node.depth === depth)
    let anchors = english.filter((anchor) => anchor.depth === depth)
    let aligned = translated.length === anchors.length

    translated.forEach((node, i) => {
      let id =
        getAnnotationId(node) ??
        (aligned ? anchors[i].id : null) ??
        (slugify(toString(node)) || `section-${depth}-${i + 1}`)
      setId(node, id)
    })
  }
}

export function remarkTranslatedHeadingIds() {
  return (tree, file) => assignTranslatedHeadingIds(tree, file?.path)
}
