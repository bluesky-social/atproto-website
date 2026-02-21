'use client'

import Link from 'next/link'
import {
  type MotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion'

import { GridPattern } from '@/components/GridPattern'
import { Heading } from '@/components/Heading'
import { BoltIcon } from '@/components/icons/BoltIcon'
import { PackageIcon } from '@/components/icons/PackageIcon'
import { LinkIcon } from '@/components/icons/LinkIcon'
import { ShapesIcon } from '@/components/icons/ShapesIcon'

interface Spec {
  href: string
  name: Record<string, string>
  description: Record<string, string>
  icon: React.ComponentType<{ className?: string }>
  pattern: Omit<
    React.ComponentPropsWithoutRef<typeof GridPattern>,
    'width' | 'height' | 'x'
  >
}

const specs: Array<Spec> = [
  {
    href: '/specs/repository',
    name: { en: 'Repository', pt: 'Repositório', ja: 'リポジトリ' },
    description: {
      en: 'Self-authenticating storage for public account content.',
      pt: 'Armazenamento autoautenticado para conteúdo de conta pública.',
      ja: 'パブリック アカウント コンテンツ用の自己認証ストレージ。',
    },
    icon: PackageIcon,
    pattern: {
      y: 22,
      squares: [[0, 1]],
    },
  },
  {
    href: '/specs/lexicon',
    name: { en: 'Lexicon', pt: 'Lexicon', ja: '用語集' },
    description: {
      en: 'A schema definition language for atproto.',
      pt: 'Uma linguagem de definição de esquema para atproto.',
      ja: 'atproto のスキーマ定義言語。',
    },
    icon: ShapesIcon,
    pattern: {
      y: 32,
      squares: [
        [0, 2],
        [1, 4],
      ],
    },
  },
  {
    href: '/specs/xrpc',
    name: {
      en: 'HTTP API (XRPC)',
      pt: 'HTTP API (XRPC)',
      ja: 'HTTP API (XRPC)',
    },
    description: {
      en: 'Cross-system queries and procedures over HTTP.',
      pt: 'Consultas e procedimentos entre sistemas via HTTP.',
      ja: 'HTTP 経由のシステム間クエリとプロシージャ。',
    },
    icon: BoltIcon,
    pattern: {
      y: -6,
      squares: [
        [-1, 2],
        [1, 3],
      ],
    },
  },
  {
    href: '/specs/at-uri-scheme',
    name: { en: 'URI Scheme', pt: 'Esquema URI', ja: 'URI スキーム' },
    description: {
      en: 'A URI scheme for addressing atproto repository data.',
      pt: 'Um esquema URI para endereçar dados do repositório atproto.',
      ja: 'atproto リポジトリ データをアドレス指定するための URI スキーム。',
    },
    icon: LinkIcon,
    pattern: {
      y: 16,
      squares: [
        [0, 1],
        [1, 3],
      ],
    },
  },
]

function SpecIcon({ icon: Icon }: { icon: Spec['icon'] }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/5 ring-1 ring-zinc-900/25 backdrop-blur-[2px] transition duration-300 group-hover:bg-white/50 group-hover:ring-zinc-900/25 dark:bg-white/7.5 dark:ring-white/15 dark:group-hover:bg-blue-300/10 dark:group-hover:ring-blue-400">
      <Icon className="h-5 w-5 fill-zinc-700/10 stroke-zinc-700 transition-colors duration-300 group-hover:stroke-zinc-900 dark:fill-white/10 dark:stroke-zinc-400 dark:group-hover:fill-blue-300/10 dark:group-hover:stroke-blue-400" />
    </div>
  )
}

function SpecPattern({
  mouseX,
  mouseY,
  ...gridProps
}: Spec['pattern'] & {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl transition duration-300 [mask-image:linear-gradient(white,transparent)] group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/[0.02] stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...gridProps}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#e9f7ff] to-[#cee7f9] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#12294d] dark:to-[#003964]"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:fill-white/2.5 dark:stroke-white/10"
          {...gridProps}
        />
      </motion.div>
    </div>
  )
}

function Spec({ resource, lang }: { resource: Spec; lang: string }) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      key={resource.href}
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <SpecPattern {...resource.pattern} mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/7.5 group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      <div className="relative rounded-2xl px-4 pb-4 pt-16">
        <SpecIcon icon={resource.icon} />
        <h3 className="mt-4 text-sm font-semibold leading-7 text-zinc-900 dark:text-white">
          <Link href={resource.href}>
            <span className="absolute inset-0 rounded-2xl" />
            {resource.name[lang] || resource.name.en}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {resource.description[lang] || resource.description.en}
        </p>
      </div>
    </div>
  )
}

export function Specs({ lang }: { lang: string }) {
  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="resources">
        Specs
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {specs.map((resource) => (
          <Spec key={resource.href} resource={resource} lang={lang} />
        ))}
      </div>
    </div>
  )
}
