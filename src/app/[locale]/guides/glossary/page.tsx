export const metadata = {
  title: 'Glossary of terms',
  description:
    'A collection of terminology used in the AT Protocol and their definitions.',
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
