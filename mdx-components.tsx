import * as mdxComponents from '@/components/mdx'

declare global {
  type MDXProvidedComponents = typeof mdxComponents
}

export function useMDXComponents() {
  return mdxComponents
}
