export const metadata = {
  title: 'Atproto Ethos',
  description:
    "A deep dive into the philosophical and aesthetic principles underlying the design of AT Protocol.",
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
