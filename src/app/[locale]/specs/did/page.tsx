export const metadata = {
  title: 'DID',
  description: 'Persistent decentralized identifiers (as used in atproto)',
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
