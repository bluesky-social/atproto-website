import { Usecases } from '@/components/home/Usecases'
import Link from 'next/link'
import { OutlineIconEnum, Icon } from '@/components/icons/outline'

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
    <div className="flex flex-1 flex-col gap-16 px-8 pb-16 pt-16 xl:max-w-6xl xl:px-16">
      <Usecases />
      <div className="grid gap-6 md:grid-cols-2">
        <NavItem
          icon="key"
          title="Auth"
          description="Login and permissions"
          href="/guides/auth"
        />
        <NavItem
          icon="database"
          title="Reads / Writes"
          description="User data repos"
          href="/guides/reads-and-writes"
        />
        <NavItem
          icon="stream"
          title="Sync"
          description="Stream user activity"
          href="/guides/sync"
        />
        <NavItem
          icon="puzzle-piece"
          title="Lexicon"
          description="Record and API schemas"
          href="/guides/lexicon"
        />
        <NavItem
          icon="media"
          title="Images & Videos"
          description="Solve your CDN"
          href="/guides/images-and-video"
        />
        <NavItem
          icon="flag"
          title="Moderation"
          description="Keep things chill"
          href="/guides/moderation"
        />
      </div>
    </div>
  )
}

function NavItem({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: OutlineIconEnum
}) {
  return (
    <Link className="group flex flex-row items-center gap-6" href={href}>
      <div>
        <div className="rounded-sm p-4 ring-1 ring-zinc-900/15 group-hover:ring-zinc-900/30 dark:ring-zinc-100/15 dark:group-hover:ring-zinc-100/25">
          <Icon
            icon={icon}
            className="size-8 fill-none stroke-current"
            strokeWidth="1.0"
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-2xl font-medium leading-normal">{title}</div>
        <div className="text-zinc-700 dark:text-zinc-400">{description}</div>
      </div>
    </Link>
  )
}
