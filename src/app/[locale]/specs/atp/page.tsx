export const metadata = {
  title: 'AT Protocol',
  description:
    'Specification for the Authenticated Transfer Protocol (AT Protocol)',
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
