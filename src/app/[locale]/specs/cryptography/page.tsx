export const metadata = {
  title: 'Cryptography',
  description:
    'Cryptographic systems, curves, and key types used in AT Protocol',
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
