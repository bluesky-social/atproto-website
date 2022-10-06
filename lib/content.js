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
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(await fsp.readFile(join(CONTENT_DIR, folder, filename), 'utf-8'))
  content.bodyHTML = String(html)
  return content
}

/*export interface Post {
  path: string
  title: string
  date: string
  summary: string
  bodyHTML: string
}

export async function listPostIDs() {
  const postFileNames = await fsp.readdir(BLOG_DIR)
  return postFileNames
    .filter((name) => name.endsWith('.md'))
    .map((name) => basename(name, '.md'))
}

export async function listPosts() {
  const postFileNames = await fsp.readdir(BLOG_DIR)
  const postMetas = await Promise.all(
    postFileNames.map((filename) => getPost(filename))
  )
  postMetas.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
  return postMetas
}

export async function getPost(filename: string): Promise<Post> {
  let post = undefined
  let html = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(() => (tree) => {
      const frontmatter = tree.children.find((c) => c.type === 'yaml')
      if (!frontmatter)
        throw new Error(`No frontmatter found on blog/${filename}`)
      // @ts-ignore .value does exist -prf
      post = YAML.parse(frontmatter.value)
      if (!post.title)
        throw new Error(`Frontmatter in blog/${filename} is missing a title`)
      if (!post.date)
        throw new Error(`Frontmatter in blog/${filename} is missing a date`)
      if (!post.summary)
        throw new Error(`Frontmatter in blog/${filename} is missing a summary`)
      post.path = `/blog/${basename(filename, '.md')}`
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(await fsp.readFile(join(BLOG_DIR, filename), 'utf-8'))
  post.bodyHTML = String(html)
  return post
}
*/
