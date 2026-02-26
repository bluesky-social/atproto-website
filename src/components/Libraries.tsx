import Link from 'next/link'
import Image from 'next/image'

import { Heading } from '@/components/Heading'
import logoGo from '@/images/logos/go.svg'
import logoTs from '@/images/logos/ts.svg'
import logoPython from '@/images/logos/python.svg'
import logoRuby from '@/images/logos/ruby.svg'
import logoPhp from '@/images/logos/php.svg'
import logoZig from '@/images/logos/zig.svg'
import logoDart from '@/images/logos/dart.svg'
import logoElixir from '@/images/logos/elixir.svg'
import logoCsharp from '@/images/logos/csharp.svg'
import logoRust from '@/images/logos/rust.svg'
import logoSwift from '@/images/logos/swift.svg'

type Status = 'full' | 'partial' | 'none' | 'unknown'

interface LibraryProp {
  href: string
  name: string
  sdkName?: string
  description: string
  logo: any
  status: {
    // Client features
    identifiers: Status
    bskyHelpers: Status
    lexicon: Status
    identity: Status
    streaming: Status
    serviceAuth: Status
    // Protocol features
    crypto: Status
    repo: Status
    plc: Status
    oauthServer: Status
  }
}

const official: LibraryProp[] = [
  {
    href: 'https://github.com/bluesky-social/atproto/tree/main/packages/lex/lex',
    name: 'TypeScript',
    description:
      'Created by Bluesky Social PBC. Works on Web, NodeJS, and React Native.',
    logo: logoTs,
    status: {
      identifiers: 'full',
      bskyHelpers: 'full',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'full',
      crypto: 'full',
      repo: 'full',
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
      identifiers: 'full',
      bskyHelpers: 'partial',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'full',
      crypto: 'full',
      repo: 'full',
      plc: 'none',
      oauthServer: 'none',
    },
  },
]

const community: LibraryProp[] = [
  {
    href: 'https://atproto.blue/',
    name: 'Python',
    sdkName: 'atproto',
    description: 'Created by @marshal.dev.',
    logo: logoPython,
    status: {
      identifiers: 'partial',
      bskyHelpers: 'full',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'partial',
      crypto: 'partial',
      repo: 'none',
      plc: 'partial',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://github.com/blacksky-algorithms/rsky',
    name: 'Rust',
    sdkName: 'rsky',
    description: 'Created by Blacksky Algorithms.',
    logo: logoRust,
    status: {
      identifiers: 'full',
      bskyHelpers: 'full',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'partial',
      crypto: 'full',
      repo: 'full',
      plc: 'partial',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://github.com/myConsciousness/atproto.dart',
    name: 'Dart',
    sdkName: 'atproto.dart',
    description: 'Created by @myConsciousness.',
    logo: logoDart,
    status: {
      identifiers: 'full',
      bskyHelpers: 'full',
      lexicon: 'full',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'partial',
      crypto: 'partial',
      repo: 'none',
      plc: 'full',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://github.com/MasterJ93/ATProtoKit',
    name: 'Swift',
    sdkName: 'ATProtoKit',
    description: 'Created by @MasterJ93.',
    logo: logoSwift,
    status: {
      identifiers: 'full',
      bskyHelpers: 'full',
      lexicon: 'partial',
      identity: 'partial',
      streaming: 'none',
      serviceAuth: 'partial',
      crypto: 'none',
      repo: 'none',
      plc: 'none',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://github.com/blowdart/idunno.Bluesky',
    name: 'C# (.NET)',
    sdkName: 'idunno.Bluesky',
    description: 'Created by Barry Dorrans.',
    logo: logoCsharp,
    status: {
      identifiers: 'partial',
      bskyHelpers: 'full',
      lexicon: 'none',
      identity: 'partial',
      streaming: 'partial',
      serviceAuth: 'partial',
      crypto: 'none',
      repo: 'none',
      plc: 'none',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://ruby.sdk.blue',
    name: 'Ruby',
    sdkName: 'Ruby SDK',
    description: 'Created by @mackuba.eu.',
    logo: logoRuby,
    status: {
      identifiers: 'partial',
      bskyHelpers: 'partial',
      lexicon: 'none',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'partial',
      crypto: 'none',
      repo: 'none',
      plc: 'none',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://tangled.org/zat.dev/zat',
    name: 'Zig',
    sdkName: 'zat',
    description: 'Created by @zzstoatzz.io.',
    logo: logoZig,
    status: {
      identifiers: 'full',
      bskyHelpers: 'none',
      lexicon: 'none',
      identity: 'full',
      streaming: 'full',
      serviceAuth: 'partial',
      crypto: 'partial',
      repo: 'none',
      plc: 'partial',
      oauthServer: 'none',
    },
  },
  {
    href: 'https://tangled.org/did:web:comet.sh/atex',
    name: 'Elixir',
    sdkName: 'atex',
    description: 'Created by @ovyerus.com.',
    logo: logoElixir,
    status: {
      identifiers: 'partial',
      bskyHelpers: 'none',
      lexicon: 'partial',
      identity: 'partial',
      streaming: 'none',
      serviceAuth: 'none',
      crypto: 'none',
      repo: 'none',
      plc: 'none',
      oauthServer: 'partial',
    },
  },
  {
    href: 'https://github.com/aazsamir/libphpsky',
    name: 'PHP',
    sdkName: 'libphpsky',
    description: 'Created by @aazsamir.',
    logo: logoPhp,
    status: {
      identifiers: 'partial',
      bskyHelpers: 'full',
      lexicon: 'full',
      identity: 'partial',
      streaming: 'full',
      serviceAuth: 'full',
      crypto: 'none',
      repo: 'none',
      plc: 'none',
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
          <Library key={library.href} library={library} />
        ))}
      </div>
      <Heading level={2} id="community-libraries">
        Community libraries
      </Heading>
      <div className="not-prose border-t border-zinc-900/5 sm:grid-cols-2 xl:max-w-none xl:grid-cols-3 dark:border-white/5">
        {community.map((library) => (
          <Library key={library.href} library={library} />
        ))}
      </div>
    </div>
  )
}

export function Library({ library }: { library: LibraryProp }) {
  return (
    <div className="mt-8 flex flex-row-reverse gap-6">
      <div className="flex-auto">
        <Link href={library.href} target="_blank" rel="noopener noreferrer">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {library.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {library.sdkName && (
            <>
              <Link
                href={library.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-800 hover:underline dark:text-zinc-200"
              >
                {library.sdkName}
              </Link>
              {' · '}
            </>
          )}
          {library.description}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-1">
          <span className="inline-flex flex-wrap items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-1 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800/60 dark:ring-zinc-700/50">
            <span className="pr-1 text-xs text-zinc-400 dark:text-zinc-500">
              Client
            </span>
            <Pill status={library.status.identifiers} label="identifiers" />
            <Pill status={library.status.bskyHelpers} label="bsky helpers" />
            <Pill status={library.status.lexicon} label="lexicon" />
            <Pill status={library.status.identity} label="identity" />
            <Pill status={library.status.streaming} label="streaming" />
            <Pill status={library.status.serviceAuth} label="service auth" />
          </span>
          <Pill status={library.status.crypto} label="crypto" />
          <Pill status={library.status.repo} label="repo" />
          <Pill status={library.status.plc} label="plc" />
          <Pill status={library.status.oauthServer} label="oauth server" />
        </p>
      </div>
      <Link href={library.href} target="_blank" rel="noopener noreferrer">
        <Image src={library.logo} alt="" className="h-12 w-12" unoptimized />
      </Link>
    </div>
  )
}
