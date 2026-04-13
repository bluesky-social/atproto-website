const homeTranslations: Record<string, Record<string, string>> = {
  ja: {
    // page.tsx hero
    'Building the Social Internet.': 'ソーシャルインターネットを築く。',
    'GET STARTED': 'はじめる',
    'Users': 'ユーザー',
    'Totally normal posts': 'いたって普通の投稿',
    'Open data': 'オープンデータ',

    // ExplainerUnit nav items
    "It's just JSON": 'ただのJSONです',
    'The AT Protocol is a data network. Posts, likes, follows, profiles, etc, are all just JSON.':
      'ATプロトコルはデータネットワークです。投稿、いいね、フォロー、プロフィールなど、すべてJSONです。',
    'Strongly typed': '強力な型付け',
    'Compose and extend records with shared schemas.': '共有スキーマでレコードを構成・拡張できます。',
    'Hyperlinked': 'ハイパーリンク',
    'Everything has a URL. Everyone posts from their own account. Everything is interlinked.':
      'すべてにURLがあります。誰もが自分のアカウントから投稿します。すべてが相互にリンクされています。',
    'With strong links': '強いリンク',
    "Use content-IDs to create strong links to other users' data.":
      'コンテンツIDで他のユーザーのデータへの強いリンクを作成します。',
    'LEARN MORE': '詳しく見る',
    'Next': '次へ',

    // Firehose
    'Public Firehose': 'パブリックファイアホース',
    'Tap into the event stream for all public activity. Build feeds, bots, search engines, and applications using live activity. No API key required.':
      'すべての公開アクティビティのイベントストリームにアクセスできます。ライブアクティビティを使ってフィード、ボット、検索エンジン、アプリを構築しましょう。APIキーは不要です。',
    'Stop stream': '停止',
    'Start stream': '開始',

    // Usecases
    'Create an App': 'アプリを作る',
    'Tap into the shared Atmosphere network to create your next app.':
      '共有のAtmosphereネットワークを活用して次のアプリを作りましょう。',
    'Build an Agent': 'エージェントを作る',
    'Listen to the firehose for mentions and reply to users automatically.':
      'ファイアホースでメンションを受信し、自動返信しましょう。',
    'Write an Algorithm': 'アルゴリズムを書く',
    'Use simple rules or advanced ML to create custom feeds.':
      'シンプルなルールや高度なMLでカスタムフィードを作りましょう。',
    'Login with user-owned identities': 'ユーザー所有のIDでログイン',
    "Usernames are just domains. We're @atproto.com!": 'ユーザー名はドメインです。私たちは@atproto.com！',

    // BentoNav labels
    'Tutorials': 'チュートリアル',
    'Auth': '認証',
    'Read / Write': '読み取りと書き込み',
    'Sync': '同期',
    'Lexicon': 'Lexicon',
    'Media': 'メディア',
    'Moderation': 'モデレーション',
    'SDKs': 'SDK',
    'Cookbook': 'クックブック',
    'Specs': '仕様',
    'FAQ': 'FAQ',
    'Self-hosting': 'セルフホスティング',
    'Showcase': 'ショーケース',
    'Blog': 'ブログ',
  },
}

export function homeT(locale: string, key: string): string {
  return homeTranslations[locale]?.[key] ?? key
}
