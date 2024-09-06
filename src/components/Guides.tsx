import { Button } from '@/components/Button'
import { Heading } from '@/components/Heading'

interface Guide {
  href: string
  name: string
  description: string
}

const lang_guides: Record<string, Guide[]> = {
  en: [
    {
      href: '/guides/applications',
      name: 'Quickstart',
      description: 'Create an application and start building.',
    },
    {
      href: '/guides/self-host',
      name: 'Self-host',
      description: 'Learn how to set up your own personal data server.',
    },
    {
      href: '/guides/glossary',
      name: 'Glossary',
      description: 'Definitions for all the terminology used in AT Protocol.',
    },
    {
      href: '/guides/faq',
      name: 'FAQ',
      description: 'Frequently Asked Questions about the Atmosphere.',
    },
  ],
  pt: [
    {
      href: '/guides/applications',
      name: 'Início rápido',
      description: 'Crie um aplicativo e comece a construir.',
    },
    {
      href: '/guides/self-host',
      name: 'Auto-hospedagem',
      description:
        'Aprenda a configurar seu próprio servidor de dados pessoais.',
    },
    {
      href: '/guides/glossary',
      name: 'Glossário',
      description: 'Definições para toda a terminologia usada no Protocolo AT.',
    },
    {
      href: '/guides/faq',
      name: 'FAQ',
      description: 'Perguntas frequentes sobre a atmosfera.',
    },
  ],
  ja: [
    {
      href: '/guides/applications',
      name: 'クイックスタート',
      description: 'アプリケーションを作成して構築を開始します。',
    },
    {
      href: '/guides/self-host',
      name: 'セルフホスト',
      description: '独自のパーソナル データ サーバーを設定する方法を学びます。',
    },
    {
      href: '/guides/glossary',
      name: '用語集',
      description: 'AT プロトコルで使用されるすべての用語の定義。',
    },
    {
      href: '/guides/faq',
      name: 'FAQ',
      description: 'Atmosphere に関するよくある質問。',
    },
  ],
}

export function Guides({ lang }: { lang: string }) {
  const guides = lang in lang_guides ? lang_guides[lang] : lang_guides.en

  return (
    <div className="my-16 xl:max-w-none">
      <Heading level={2} id="guides">
        Guides
      </Heading>
      <div className="not-prose mt-4 grid grid-cols-1 gap-8 border-t border-zinc-900/5 pt-10 sm:grid-cols-2 xl:grid-cols-4 dark:border-white/5">
        {guides.map((guide) => (
          <div key={guide.href}>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
              {guide.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {guide.description}
            </p>
            <p className="mt-4">
              <Button href={guide.href} variant="text" arrow="right">
                Read more
              </Button>
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
