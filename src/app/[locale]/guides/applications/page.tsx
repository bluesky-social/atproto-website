export const metadata = {
  title: 'Quick start guide to building applications on AT Protocol',
  description:
    'In this guide, we\'re going to build a simple multi-user app that publishes your current "status" as an emoji.',
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
