import { Usecases } from '@/components/home/Usecases'
import Link from 'next/link'
import { OutlineIconEnum, Icon } from '@/components/icons/outline'

export const header = {
  title: 'さあ、作ろう',
  description:
    '相互運用可能な大規模ソーシャルアプリケーションを作成しましょう',
  primaryCTA: {
    label: '導入',
    href: '/guides/understanding-atproto',
  },
  secondaryCTA: {
    label: 'SDK',
    href: '/sdks',
  },
}

export default function DocsHome() {
  return (
    <div className="flex flex-1 flex-col gap-16 px-8 pb-16 pt-8 md:pt-16 xl:max-w-6xl xl:px-16">
      <div className="grid gap-6 md:grid-cols-2">
        <NavItem
          icon="key"
          title="認証"
          description="ログインと権限"
          href="/guides/auth"
        />
        <NavItem
          icon="database"
          title="読み書き"
          description="データリポジトリ"
          href="/guides/reads-and-writes"
        />
        <NavItem
          icon="stream"
          title="同期"
          description="ストリーミング"
          href="/guides/sync"
        />
        <NavItem
          icon="puzzle-piece"
          title="Lexicon"
          description="レコードとAPIのスキーマ"
          href="/guides/lexicon"
        />
        <NavItem
          icon="media"
          title="画像と動画"
          description="CDN利用"
          href="/guides/images-and-video"
        />
        <NavItem
          icon="flag"
          title="モデレーション"
          description="安全と信頼の組み立て"
          href="/guides/moderation"
        />
      </div>
      <div className="[html_:where(&amp;&gt;*)]:max-w-2xl [html_:where(&amp;&gt;*)]:lg:max-w-3xl prose flex-auto dark:prose-invert">
        <h2 className="scroll-mt-24">
          Atprotoとは
        </h2>
        <p>
          Atprotoは、大規模向けのオープンソーシャルプロトコルです。ユーザーはJSONレコードをリポジトリに公開します。レコードの変更ストリームはネットワーク全体で同期され、アプリケーションを駆動します。
        </p>
        <p>
          コミュニティメンバーの
          <a
            href="https://bsky.app/profile/danabra.mov"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dan Abramov
          </a>
          による、素晴らしい記事をおすすめします。
        </p>
        <ul>
          <li>
            <Link href="https://overreacted.io/open-social/">
              <strong>Open Social</strong>
            </Link>{' '}
            - プロトコルはAPIである
          </li>
          <li>
            <Link href="https://overreacted.io/where-its-at/">
              <strong>Where it&apos;s at://</strong>
            </Link>{' '}
            - ハンドルからホスティングに辿り着くまで
          </li>
          <li>
            <Link href="https://overreacted.io/a-social-filesystem/">
              <strong>A Social Filesystem</strong>
            </Link>{' '}
            - フォーマットはアプリを超える
          </li>
        </ul>
        <p>
          さらに学びたければ、<Link href="/guides/understanding-atproto">導入</Link>をお読みください。
        </p>
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
