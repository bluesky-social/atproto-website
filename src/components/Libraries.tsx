import Link from 'next/link'
import Image from 'next/image'

import { Heading } from '@/components/Heading'
import logoGo from '@/images/logos/go.svg'
import logoTs from '@/images/logos/ts.svg'
import logoPython from '@/images/logos/python.svg'

type Status = 'full' | 'partial' | 'none' | 'unknown'

interface LibraryProp {
  href: string
  name: string
  description: string
  logo: any
  status: {
    httpClient: Status
    identifiers: Status
    bsky: Status
    crypto: Status
    mst: Status
    lexicon: Status
    identity: Status
    streaming: Status
    serviceAuth: Status
    plc: Status
    oauthServer: Status
  }
}

const official: LibraryProp[] = [
  {
    href: 'https://github.com/bluesky-social/atproto/tree/main/packages/lex/lex',
    name: 'Typescript',
    description:
      'Created by Bluesky Social PBC. Works on Web, NodeJS, and React Native.',
    logo: logoTs,
    status: {
      httpClient: 'full',
      identifiers: 'full',
      bsky: 'full',
      crypto: 'full',
      mst: 'full',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'full',
      plc: 'full',
      oauthServer: 'full',
    },
  },
  {
    href: 'https://github.com/bluesky-social/indigo/tree/main',
    name: 'Go',
    description: 'Created by Bluesky Social PBC.',
    logo: logoGo,
    status: {
      httpClient: 'partial',
      identifiers: 'full',
      bsky: 'none',
      crypto: 'full',
      mst: 'full',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'full',
      plc: 'none',
      oauthServer: 'none',
    },
  },
]

const community: LibraryProp[] = [
  {
    href: 'https://atproto.blue/',
    name: 'Python',
    description: 'Created by @marshal.dev.',
    logo: logoPython,
    status: {
      httpClient: 'full',
      identifiers: 'partial',
      bsky: 'full',
      crypto: 'partial',
      mst: 'none',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'partial',
      plc: 'partial',
      oauthServer: 'none',
    },
  },
]

function Pill({ status, label }: { status: Status; label: string }) {
  if (status === 'unknown') {
    return <></>
  }

  const color =
    status === 'none'
      ? 'fill-red-500 dark:fill-red-400'
      : status === 'partial'
        ? 'fill-yellow-500 dark:fill-yellow-400'
        : 'fill-green-500 dark:fill-green-400'
  return (
    <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 text-xs font-medium text-gray-900 ring-1 ring-inset ring-gray-200 dark:text-white dark:ring-gray-800">
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`h-1.5 w-1.5 ${color}`}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {label}
    </span>
  )
}

export function Libraries() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="official-libraries">
        Official libraries
      </Heading>
      <div className="not-prose border-t border-zinc-900/5 sm:grid-cols-2 xl:max-w-none xl:grid-cols-3 dark:border-white/5">
        {official.map((library) => (
          <Library key={library.name} library={library} />
        ))}
      </div>
      <Heading level={2} id="community-libraries">
        Community libraries
      </Heading>
      <div className="not-prose border-t border-zinc-900/5 sm:grid-cols-2 xl:max-w-none xl:grid-cols-3 dark:border-white/5">
        {community.map((library) => (
          <Library key={library.name} library={library} />
        ))}
      </div>
    </div>
  )
}

export function Library({ library }: { library: LibraryProp }) {
  return (
    <div className="mt-8 flex flex-row-reverse gap-6">
      <div className="flex-auto">
        <Link href={library.href}>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {library.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {library.description}
        </p>
        <p className="mt-2 flex flex-wrap gap-1">
          <Pill status={library.status.httpClient} label="http client" />
          <Pill status={library.status.identifiers} label="identifiers" />
          <Pill status={library.status.bsky} label="bsky" />
          <Pill status={library.status.crypto} label="crypto" />
          <Pill status={library.status.mst} label="mst" />
          <Pill status={library.status.lexicon} label="lexicon" />
          <Pill status={library.status.identity} label="identity" />
          <Pill status={library.status.streaming} label="streaming" />
          <Pill status={library.status.serviceAuth} label="service auth" />
          <Pill status={library.status.plc} label="plc" />
          <Pill status={library.status.oauthServer} label="oauth server" />
        </p>
      </div>
      <Link href={library.href}>
        <Image src={library.logo} alt="" className="h-12 w-12" unoptimized />
      </Link>
    </div>
  )
}
