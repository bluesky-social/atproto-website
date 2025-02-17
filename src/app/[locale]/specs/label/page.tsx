export const metadata = {
  title: 'Labels',
  description:
    'Self-authenticating string annotations on accounts or content for moderation and other purposes.',
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
