export const metadata = {
  title: 'Blob Lifecycle - AT Protocol Docs',
  description: 'Working with image and video blobs in the AT Protocol.',
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
