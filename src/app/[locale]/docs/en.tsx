import { Usecases } from '@/components/home/Usecases'
import Link from 'next/link'
import { NavGrid, NavGridItem } from '@/components/NavGrid'

export const header = {
  title: 'We can just build things',
  description:
    'Create high-scale social applications that are interoperable by default.',
  primaryCTA: {
    label: 'Intro',
    href: '/guides/understanding-atproto',
  },
  secondaryCTA: {
    label: 'SDKs',
    href: '/sdks',
  },
}

export default function DocsHome() {
  return (
    <div className="flex flex-1 flex-col gap-16 px-8 pb-16 pt-8 md:pt-16 xl:max-w-6xl xl:px-16">
      <NavGrid>
        <NavGridItem
          icon="key"
          title="Auth"
          description="Login and permissions"
          href="/guides/auth"
        />
        <NavGridItem
          icon="database"
          title="Reads / Writes"
          description="User data repos"
          href="/guides/reads-and-writes"
        />
        <NavGridItem
          icon="stream"
          title="Sync"
          description="Stream user activity"
          href="/guides/sync"
        />
        <NavGridItem
          icon="puzzle-piece"
          title="Lexicon"
          description="Record and API schemas"
          href="/guides/lexicon"
        />
        <NavGridItem
          icon="media"
          title="Images & Videos"
          description="Solve your CDN"
          href="/guides/images-and-video"
        />
        <NavGridItem
          icon="flag"
          title="Moderation"
          description="Composable trust and safety"
          href="/guides/moderation"
        />
      </NavGrid>
      <div className="[html_:where(&amp;&gt;*)]:max-w-2xl [html_:where(&amp;&gt;*)]:lg:max-w-3xl prose flex-auto dark:prose-invert">
        <h2 className="scroll-mt-24">
          What is this?
        </h2>
        <p>
          Atproto is a big-world open social protocol. Users publish JSON records into
          repositories. The changestreams of those records then sync across the
          network to drive applications.
        </p>
        <p>
          We recommend these fantastic articles by community member{' '}
          <a
            href="https://bsky.app/profile/danabra.mov"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dan Abramov
          </a>
          :
        </p>
        <ul>
          <li>
            <Link href="https://overreacted.io/open-social/">
              <strong>Open Social</strong>
            </Link>{' '}
            - The protocol is the API.
          </li>
          <li>
            <Link href="https://overreacted.io/where-its-at/">
              <strong>Where it&apos;s at://</strong>
            </Link>{' '}
            - From handles to hosting.
          </li>
          <li>
            <Link href="https://overreacted.io/a-social-filesystem/">
              <strong>A Social Filesystem</strong>
            </Link>{' '}
            - Formats over apps.
          </li>
          <li>
            <Link href="https://overreacted.io/there-are-no-instances-in-atproto/">
              <strong>There Are No Instances in atproto</strong>
            </Link>{' '}
            - On big world decentralization.
          </li>
        </ul>
        <p>
          Or, learn more <Link href="/guides/understanding-atproto">in our intro doc</Link>.
        </p>
      </div>
    </div>
  )
}
