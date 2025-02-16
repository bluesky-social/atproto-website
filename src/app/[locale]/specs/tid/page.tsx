export const metadata = {
  title: 'Timestamp Identifiers (TIDs)',
  description:
    'A compact timestamp-based identifier for revisions and records.',
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
