export const metadata = {
  title: 'Sync - AT Protocol Docs',
  description: 'Synchronizing and streaming data from the AT Protocol.',
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
