export const metadata = {
  title: 'Permission Requests',
  description: 'A permissions guide for app developers and Lexicon designers',
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
