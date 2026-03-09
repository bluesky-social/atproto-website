import { Usecases } from '@/components/home/Usecases'
import Link from 'next/link'
import { OutlineIconEnum, Icon } from '@/components/icons/outline'

export const header = {
  title: '이제, 만들어 봅시다',
  description:
    '기본적으로 상호운용 가능한 대규모 소셜 애플리케이션을 만들어 보세요.',
  primaryCTA: {
    label: '소개',
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
          title="인증"
          description="로그인과 권한"
          href="/guides/auth"
        />
        <NavItem
          icon="database"
          title="읽기 / 쓰기"
          description="사용자 데이터 저장소"
          href="/guides/reads-and-writes"
        />
        <NavItem
          icon="stream"
          title="동기화"
          description="사용자 활동 스트리밍"
          href="/guides/sync"
        />
        <NavItem
          icon="puzzle-piece"
          title="Lexicon"
          description="레코드 및 API 스키마"
          href="/guides/lexicon"
        />
        <NavItem
          icon="media"
          title="이미지 & 동영상"
          description="CDN 문제 해결"
          href="/guides/images-and-video"
        />
        <NavItem
          icon="flag"
          title="모더레이션"
          description="조합 가능한 신뢰 및 안전"
          href="/guides/moderation"
        />
      </div>
      <div className="[html_:where(&amp;&gt;*)]:max-w-2xl [html_:where(&amp;&gt;*)]:lg:max-w-3xl prose flex-auto dark:prose-invert">
        <h2 className="scroll-mt-24">
          이것은 무엇인가요?
        </h2>
        <p>
          Atproto는 대규모 오픈 소셜 프로토콜입니다. 사용자는 JSON 레코드를
          저장소에 게시합니다. 해당 레코드의 변경 스트림이 네트워크 전체에
          동기화되어 애플리케이션을 구동합니다.
        </p>
        <p>
          커뮤니티 멤버{' '}
          <a
            href="https://bsky.app/profile/danabra.mov"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dan Abramov
          </a>
          의 훌륭한 글들을 추천합니다:
        </p>
        <ul>
          <li>
            <Link href="https://overreacted.io/open-social/">
              <strong>Open Social</strong>
            </Link>{' '}
            - 프로토콜이 곧 API이다.
          </li>
          <li>
            <Link href="https://overreacted.io/where-its-at/">
              <strong>Where it&apos;s at://</strong>
            </Link>{' '}
            - 핸들에서 호스팅까지.
          </li>
          <li>
            <Link href="https://overreacted.io/a-social-filesystem/">
              <strong>A Social Filesystem</strong>
            </Link>{' '}
            - 앱보다 형식이 중요하다.
          </li>
        </ul>
        <p>
          또는 <Link href="/guides/understanding-atproto">소개 문서</Link>에서 더 알아보세요.
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
