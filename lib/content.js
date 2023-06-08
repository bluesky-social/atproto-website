import { promises as fsp } from 'fs'
import { dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import { h } from 'hastscript'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content')

export async function getNavigation() {
  const data = YAML.parse(
    await fsp.readFile(join(CONTENT_DIR, `docs.yml`), 'utf8')
  )
  return data
}

export async function getNavigationWithDesc(currentHref) {
  const data = await getNavigation(currentHref)
  for (const item of [...data.guides, ...data.specs, ...data.lexicons, ...data.community, ...data.blog]) {
    const file = await getFile(...item.href.split('/').filter(Boolean))
    item.description = file.summary
    if ("date" in file) {
      item.date = file.date
    }
  }
  return data
}


export async function getFile(folder, id) {
  const filename = `${id}.md`
  let content = undefined
  let html = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(() => (tree) => {
      const frontmatter = tree.children.find((c) => c.type === 'yaml')
      if (!frontmatter)
        throw new Error(`No frontmatter found on ${folder}/${filename}`)
      // @ts-ignore .value does exist -prf
      content = YAML.parse(frontmatter.value)
      if (!content.title)
        throw new Error(
          `Frontmatter in ${folder}/${filename} is missing a title`
        )
      if (!content.summary)
        throw new Error(
          `Frontmatter in ${folder}/${filename} is missing a summary`
        )
      content.path = `/${folder}/${basename(filename, '.md')}`
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: {
        ariaHidden: "true",
        tabIndex: -1,
        class: 'heading-link',
      },
      content(node) {
        return [h('span', '#')]
      },
    })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(await fsp.readFile(join(CONTENT_DIR, folder, filename), 'utf-8'))
  content.bodyHTML = String(html)
  return content
}
