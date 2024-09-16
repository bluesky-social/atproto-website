export const metadata = {
  title: 'ATProto for distributed systems engineers',
  description:
    "AT Protocol is the tech developed at Bluesky for open social networking. In this article we're going to explore AT Proto from the perspective of distributed backend engineering.",
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
