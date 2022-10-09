import { promises as fsp } from 'fs'
import { dirname, join, basename } from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONTENT_DIR = join(__dirname, '..', 'content')

export async function getNavigation(dataset, currentHref) {
  const data = YAML.parse(
    await fsp.readFile(join(CONTENT_DIR, `${dataset}.yml`), 'utf8')
  )
  const currentItem = data.items.find((item) => item.href === currentHref)
  if (currentItem) currentItem.current = true
  return data.items
}

export async function getNavigationWithDesc(dataset, currentHref) {
  const items = await getNavigation(dataset, currentHref)
  for (const item of items) {
    if (item.href == `/${dataset}`) {
      continue
    }
    const file = await getFile(dataset, item.href.split('/').pop())
    item.description = file.summary
  }
  return items
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
    // .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(await fsp.readFile(join(CONTENT_DIR, folder, filename), 'utf-8'))
  content.bodyHTML = String(html)
  return content
}
