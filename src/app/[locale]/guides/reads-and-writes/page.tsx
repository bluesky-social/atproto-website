export const metadata = {
  title: 'Reads and Writes - AT Protocol Docs',
  description: 'Read and Write AT Protocol Records.',
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
