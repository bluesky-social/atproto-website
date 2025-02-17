export const metadata = {
  title: 'Namespaced Identifiers (NSIDs)',
  description: 'A specification for global semantic IDs.',
}

export default async function HomePage({ params }: any) {
  try {
    const Content = (await import(`./${params.locale}.mdx`)).default
    return <Content />
  } catch (error) {
    const Content = (await import(`./en.mdx`)).default
    return <Content />
  }
}
