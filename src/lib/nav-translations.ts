const LOCALES = ['en', 'pt', 'ja', 'ko']

/**
 * Translation dictionary keyed by locale, then by lookup key.
 * - Link titles are keyed by their href path (e.g. '/guides/tutorials')
 * - Group titles are keyed by their English title (e.g. 'Get Started')
 * - UI strings are keyed by their English text (e.g. 'Pages:')
 */
const navTranslations: Record<string, Record<string, string>> = {
  ja: {
    // Group titles
    'Get Started': 'はじめに',
    'Docs': 'ドキュメント',
    'Deploy': 'デプロイ',
    'Specs': '仕様',

    // UI strings
    'Pages:': 'ページ:',

    // Link titles (from ja.mdx header.title exports)
    '/guides/tutorials': 'チュートリアル',
    '/guides/bot-tutorial': 'エージェント作成',
    '/guides/custom-feed-tutorial': 'カスタムフィード作成',
    '/guides/oauth-tutorial': 'OAuth with Next.JS',
    '/guides/oauth-cli-tutorial': 'OAuth with Node.js',
    '/guides/go-oauth-cli-tutorial': 'OAuth with Go',
    '/guides/statusphere-tutorial': 'ソーシャルアプリの作成',
    '/guides/understanding-atproto': 'atprotoを知る',
    '/articles/atproto-for-distsys-engineers': '分散システムエンジニアのためのatproto',
    '/articles/atproto-ethos': 'atprotoの基本理念',
    '/guides/faq': 'FAQ',
    '/guides/auth': '認証',
    '/guides/sdk-auth': 'SDK認証',
    '/guides/oauth-patterns': 'OAuthパターン集',
    '/guides/scopes': 'スコープ',
    '/guides/permission-sets': '権限リクエスト',
    '/guides/reads-and-writes': '読み取りと書き込み',
    '/guides/reading-data': 'データ読み取り',
    '/guides/writing-data': 'データ書き込み',
    '/guides/account-lifecycle': 'アカウントと削除',
    '/guides/social-graph': 'ソーシャルグラフ',
    '/guides/sync': '同期',
    '/guides/streaming-data': 'データストリーミング',
    '/guides/backfilling': 'バックフィル',
    '/guides/feeds': 'フィード',
    '/guides/lexicon': 'Lexicon',
    '/guides/installing-lexicons': 'Lexiconのインストール',
    '/guides/publishing-lexicons': 'Lexiconの公開',
    '/guides/lexicon-style-guide': 'Lexiconスタイルガイド',
    '/guides/images-and-video': '画像と動画',
    '/guides/blob-lifecycle': 'blobライフサイクル',
    '/guides/blob-security': 'blobのセキュリティ',
    '/guides/video-handling': '動画の取り扱い',
    '/guides/moderation': 'モデレーション',
    '/guides/labels': 'ラベル',
    '/guides/creating-a-labeler': 'ラベラーの作成',
    '/guides/subscriptions': '登録',
    '/guides/using-ozone': 'Ozoneの利用',
    '/guides/the-at-stack': 'ATスタック',
    '/guides/self-hosting': 'セルフホスティング',
    '/guides/going-to-production': '本番環境への移行',
    '/guides/account-migration': 'アカウント移行',
    '/guides/glossary': '用語集',
  },
  ko: {
    // Group titles
    'Get Started': '시작하기',
    'Docs': '문서',
    'Deploy': '배포',
    'Specs': '사양',

    // UI strings
    'Pages:': '페이지:',

    // Link titles
    '/guides/tutorials': '튜토리얼',
    '/guides/bot-tutorial': '에이전트 만들기',
    '/guides/custom-feed-tutorial': '커스텀 피드 만들기',
    '/guides/oauth-tutorial': 'OAuth with Next.js',
    '/guides/oauth-cli-tutorial': 'OAuth with Node.js',
    '/guides/go-oauth-cli-tutorial': 'OAuth with Go',
    '/guides/statusphere-tutorial': '소셜 앱 만들기',
    '/guides/understanding-atproto': 'atproto 이해하기',
    '/articles/atproto-for-distsys-engineers': '분산 시스템 엔지니어를 위한 atproto',
    '/articles/atproto-ethos': 'atproto의 기본 철학',
    '/guides/faq': 'FAQ',
    '/guides/auth': '인증',
    '/guides/sdk-auth': 'SDK 인증',
    '/guides/oauth-patterns': 'OAuth 패턴',
    '/guides/scopes': '스코프',
    '/guides/permission-sets': '권한 요청',
    '/guides/reads-and-writes': '읽기와 쓰기',
    '/guides/reading-data': '데이터 읽기',
    '/guides/writing-data': '데이터 쓰기',
    '/guides/account-lifecycle': '계정과 삭제',
    '/guides/social-graph': '소셜 그래프',
    '/guides/sync': '동기화',
    '/guides/streaming-data': '데이터 스트리밍',
    '/guides/backfilling': '백필링',
    '/guides/feeds': '피드',
    '/guides/lexicon': 'Lexicon',
    '/guides/installing-lexicons': 'Lexicon 설치',
    '/guides/publishing-lexicons': 'Lexicon 배포',
    '/guides/lexicon-style-guide': 'Lexicon 스타일 가이드',
    '/guides/images-and-video': '이미지와 동영상',
    '/guides/blob-lifecycle': 'Blob 라이프사이클',
    '/guides/blob-security': 'Blob 보안',
    '/guides/video-handling': '동영상 처리',
    '/guides/moderation': '모더레이션',
    '/guides/labels': '레이블',
    '/guides/creating-a-labeler': '레이블러 만들기',
    '/guides/subscriptions': '구독',
    '/guides/using-ozone': 'Ozone 사용하기',
    '/guides/the-at-stack': 'AT 스택',
    '/guides/self-hosting': '셀프 호스팅',
    '/guides/going-to-production': '프로덕션 배포',
    '/guides/account-migration': '계정 이전',
    '/guides/glossary': '용어집',
  },
  pt: {
    // Group titles
    'Get Started': 'Começar',
    'Docs': 'Documentação',
    'Deploy': 'Implantar',
    'Specs': 'Especificações',

    // UI strings
    'Pages:': 'Páginas:',
  },
}

/**
 * Look up a translated string for the given locale.
 * Falls back to `fallback` (if provided), then to `key` itself.
 */
export function navT(locale: string, key: string, fallback?: string): string {
  return navTranslations[locale]?.[key] ?? fallback ?? key
}

/**
 * Extract the locale prefix from a pathname.
 * Returns 'en' if no recognized locale prefix is found.
 */
export function getLocaleFromPathname(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale
    }
  }
  return 'en'
}
