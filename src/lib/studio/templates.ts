function q(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export function blogPageTsx(input: {
  title: string
  description: string
}): string {
  return `import { Page } from '@/components/Page'

export const metadata = {
  title: '${q(input.title)}',
  description: '${q(input.description)}',
}

export default async function BlogPost({ params }: any) {
  let Content
  try {
    Content = await import(\`./\${(await params).locale}.mdx\`)
  } catch (error) {
    Content = await import(\`./en.mdx\`)
  }
  return <Page {...Content} />
}
`
}
