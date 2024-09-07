export const metadata = {
  title: 'Self-hosting',
  description:
    'Self-hosting a Bluesky PDS means running your own Personal Data Server that is capable of federating with the wider ATProto network.',
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
