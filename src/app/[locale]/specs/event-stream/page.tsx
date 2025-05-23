export const metadata = {
  title: 'Event Stream',
  description:
    'Network wire protocol for subscribing to a stream of Lexicon objects',
  wip: true,
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
