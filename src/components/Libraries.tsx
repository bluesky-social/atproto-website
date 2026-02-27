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

interface SDKEntry {
  href: string
  sdkName?: string
  description: string
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

interface LibraryGroupProp {
  name: string
  logo: any
  sdks: SDKEntry[]
}

const official: LibraryGroupProp[] = [
  {
    name: 'TypeScript',
    logo: logoTs,
    sdks: [
      {
        href: 'https://github.com/bluesky-social/atproto/tree/main/packages/lex/lex',
        description:
          'Created by Bluesky Social PBC. Works on Web, NodeJS, and React Native.',
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
    ],
  },
  {
    name: 'Go',
    logo: logoGo,
    sdks: [
      {
        href: 'https://github.com/bluesky-social/indigo/tree/main',
        description: 'Created by Bluesky Social PBC.',
        status: {
          identifiers: 'full',
          bskyHelpers: 'partial',
          lexicon: 'full',
          identity: 'full',
          streaming: 'full',
          serviceAuth: 'full',
          crypto: 'full',
          repo: 'full',
          plc: 'full',
          oauthServer: 'none',
        },
      },
    ],
  },
]

const community: LibraryGroupProp[] = [
  {
    name: 'Python',
    logo: logoPython,
    sdks: [
      {
        href: 'https://atproto.blue/',
        sdkName: 'atproto',
        description: 'Created by @marshal.dev.',
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
    ],
  },
  {
    name: 'Rust',
    logo: logoRust,
    sdks: [
      {
        href: 'https://github.com/blacksky-algorithms/rsky',
        sdkName: 'rsky',
        description: 'Created by Blacksky Algorithms.',
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
        href: 'https://crates.io/crates/jacquard',
        sdkName: 'jacquard',
        description: 'Created by @nonbinary.computer.',
        status: {
          identifiers: 'full',
          bskyHelpers: 'partial',
          lexicon: 'full',
          identity: 'full',
          streaming: 'full',
          serviceAuth: 'partial',
          crypto: 'full',
          repo: 'full',
          plc: 'none',
          oauthServer: 'none',
        },
      },
      {
        href: 'https://tangled.org/ngerakines.me/atproto-crates',
        sdkName: 'atproto-crates',
        description: 'Created by @ngerakines.me.',
        status: {
          identifiers: 'full',
          bskyHelpers: 'partial',
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
    ],
  },
  {
    name: 'TypeScript',
    logo: logoTs,
    sdks: [
      {
        href: 'https://github.com/mary-ext/atcute',
        sdkName: 'atcute',
        description: 'Created by @mary.my.id.',
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
          oauthServer: 'none',
        },
      },
    ],
  },
  {
    name: 'Dart',
    logo: logoDart,
    sdks: [
      {
        href: 'https://github.com/myConsciousness/atproto.dart',
        sdkName: 'atproto.dart',
        description: 'Created by @myConsciousness.',
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
    ],
  },
  {
    name: 'Swift',
    logo: logoSwift,
    sdks: [
      {
        href: 'https://github.com/MasterJ93/ATProtoKit',
        sdkName: 'ATProtoKit',
        description: 'Created by @MasterJ93.',
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
      }
    ],
  },
  {
    name: 'C# (.NET)',
    logo: logoCsharp,
    sdks: [
      {
        href: 'https://github.com/blowdart/idunno.Bluesky',
        sdkName: 'idunno.Bluesky',
        description: 'Created by Barry Dorrans.',
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
    ],
  },
  {
    name: 'Ruby',
    logo: logoRuby,
    sdks: [
      {
        href: 'https://ruby.sdk.blue',
        sdkName: 'Ruby SDK',
        description: 'Created by @mackuba.eu.',
        status: {
          identifiers: 'partial',
          bskyHelpers: 'none',
          lexicon: 'partial',
          identity: 'full',
          streaming: 'full',
          serviceAuth: 'none',
          crypto: 'none',
          repo: 'none',
          plc: 'partial',
          oauthServer: 'none',
        },
      },
    ],
  },
  {
    name: 'Zig',
    logo: logoZig,
    sdks: [
      {
        href: 'https://tangled.org/zat.dev/zat',
        sdkName: 'zat',
        description: 'Created by @zzstoatzz.io.',
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
    ],
  },
  {
    name: 'Elixir',
    logo: logoElixir,
    sdks: [
      {
        href: 'https://tangled.org/did:web:comet.sh/atex',
        sdkName: 'atex',
        description: 'Created by @ovyerus.com.',
        status: {
          identifiers: 'partial',
          bskyHelpers: 'none',
          lexicon: 'full',
          identity: 'full',
          streaming: 'none',
          serviceAuth: 'none',
          crypto: 'none',
          repo: 'none',
          plc: 'none',
          oauthServer: 'partial',
        },
      },
    ],
  },
  {
    name: 'PHP',
    logo: logoPhp,
    sdks: [
      {
        href: 'https://github.com/aazsamir/libphpsky',
        sdkName: 'libphpsky',
        description: 'Created by @aazsamir.',
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
    ],
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

function SDKEntryRow({ sdk, first }: { sdk: SDKEntry; first: boolean }) {
  return (
    <div className={first ? 'mt-1' : 'mt-4'}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {sdk.sdkName && (
          <>
            <Link
              href={sdk.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 hover:underline dark:text-zinc-200"
            >
              {sdk.sdkName}
            </Link>
            {' · '}
          </>
        )}
        {sdk.description}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-1">
        <span className="inline-flex flex-wrap items-center gap-1 rounded-md bg-zinc-100 px-1.5 py-1 ring-1 ring-inset ring-zinc-200 dark:bg-zinc-800/60 dark:ring-zinc-700/50">
          <span className="pr-1 text-xs text-zinc-400 dark:text-zinc-500">
            Client
          </span>
          <Pill status={sdk.status.identifiers} label="identifiers" />
          <Pill status={sdk.status.bskyHelpers} label="bsky helpers" />
          <Pill status={sdk.status.lexicon} label="lexicon" />
          <Pill status={sdk.status.identity} label="identity" />
          <Pill status={sdk.status.streaming} label="streaming" />
        </span>
        <Pill status={sdk.status.serviceAuth} label="service auth" />
        <Pill status={sdk.status.crypto} label="crypto" />
        <Pill status={sdk.status.repo} label="repo" />
        <Pill status={sdk.status.plc} label="plc" />
        <Pill status={sdk.status.oauthServer} label="oauth server" />
      </p>
    </div>
  )
}

function LibraryGroup({ group }: { group: LibraryGroupProp }) {
  const isOfficial = !group.sdks[0].sdkName
  return (
    <div className="mt-8 flex flex-row-reverse gap-6">
      <div className="flex-auto">
        {isOfficial ? (
          <Link
            href={group.sdks[0].href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3 className="text-lg font-semibold text-zinc-900 hover:underline dark:text-white">
              {group.name}
            </h3>
          </Link>
        ) : (
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {group.name}
          </h3>
        )}
        {group.sdks.map((sdk, i) => (
          <SDKEntryRow key={sdk.href} sdk={sdk} first={i === 0} />
        ))}
      </div>
      {isOfficial ? (
        <Link
          href={group.sdks[0].href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={group.logo} alt="" className="h-12 w-12" unoptimized />
        </Link>
      ) : (
        <Image src={group.logo} alt="" className="h-12 w-12" unoptimized />
      )}
    </div>
  )
}

export function Libraries() {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="official-libraries">
        Reference implementations
      </Heading>
      <div className="not-prose border-t border-zinc-900/5 sm:grid-cols-2 xl:max-w-none xl:grid-cols-3 dark:border-white/5">
        {official.map((group) => (
          <LibraryGroup key={group.name} group={group} />
        ))}
      </div>
      <Heading level={2} id="community-libraries">
        Community libraries
      </Heading>
      <div className="not-prose border-t border-zinc-900/5 sm:grid-cols-2 xl:max-w-none xl:grid-cols-3 dark:border-white/5">
        {community.map((group) => (
          <LibraryGroup key={group.name} group={group} />
        ))}
      </div>
      <div className="not-prose mt-12 border-t border-zinc-900/5 pt-8 dark:border-white/5">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          About these ratings
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Status indicators show estimated feature completeness:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          {[
            { color: 'fill-green-500 dark:fill-green-400', label: 'full', desc: 'complete or near-complete' },
            { color: 'fill-yellow-500 dark:fill-yellow-400', label: 'partial', desc: 'some support with notable gaps' },
            { color: 'fill-red-500 dark:fill-red-400', label: 'none', desc: 'not implemented' },
          ].map(({ color, label, desc }) => (
            <li key={label} className="flex items-center gap-2">
              <svg viewBox="0 0 6 6" aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 ${color}`}><circle r={3} cx={3} cy={3} /></svg>
              <span><span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span> — {desc}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-zinc-900 dark:text-white">
              Client features
            </dt>
            <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
              <ul className="space-y-1">
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">identifiers</span> — DID and handle parsing, normalization, and validation</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">bsky helpers</span> — Bluesky-specific lexicons, types, and app helpers</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">lexicon</span> — generic Lexicon schema support and XRPC client</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">identity</span> — DID and handle resolution</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">streaming</span> — WebSocket event stream (firehose/Jetstream) subscription</li>
              </ul>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-zinc-900 dark:text-white">
              Other features
            </dt>
            <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
              <ul className="space-y-1">
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">service auth</span> — service-to-service JWT authentication</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">crypto</span> — key generation, signing, and signature verification</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">repo</span> — repository data structure parsing, reading, and writing</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">plc</span> — PLC directory read/write operations</li>
                <li><span className="font-medium text-zinc-700 dark:text-zinc-300">oauth server</span> — OAuth 2.0 authorization server implementation</li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
