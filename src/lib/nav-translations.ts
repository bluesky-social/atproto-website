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
    '/guides/oauth-tutorial': 'OAuth with NextJSチュートリアル',
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
