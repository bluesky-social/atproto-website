import { BentoBox, BentoBoxIcon, BentoBoxTitle, BentoGrid } from '../Bento'
import { homeT } from '@/lib/home-translations'

export function BentoNav({ locale }: { locale?: string }) {
  const t = (key: string) => homeT(locale ?? 'en', key)
  return (
    <BentoGrid wide>
      <BentoBox href="/guides/tutorials" wide tall>
        <BentoBoxIcon icon="academic-cap" big />
        <BentoBoxTitle big>{t('Tutorials')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/auth">
        <BentoBoxIcon icon="key" small />
        <BentoBoxTitle small>{t('Auth')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/reads-and-writes">
        <BentoBoxIcon icon="database" small />
        <BentoBoxTitle small>{t('Read / Write')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/sync">
        <BentoBoxIcon icon="stream" small />
        <BentoBoxTitle small>{t('Sync')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/lexicon">
        <BentoBoxIcon icon="puzzle-piece" small />
        <BentoBoxTitle small>{t('Lexicon')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/images-and-video">
        <BentoBoxIcon icon="media" small />
        <BentoBoxTitle small>{t('Media')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/moderation">
        <BentoBoxIcon icon="flag" small />
        <BentoBoxTitle small>{t('Moderation')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/sdks" wide horz>
        <BentoBoxIcon icon="cube" />
        <BentoBoxTitle>{t('SDKs')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox
        href="https://github.com/bluesky-social/cookbook/"
        className="py-4"
      >
        <BentoBoxTitle small>{t('Cookbook')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/specs/atp" className="py-4">
        <BentoBoxTitle small>{t('Specs')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/faq" className="py-4">
        <BentoBoxTitle small>{t('FAQ')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/self-hosting" className="py-4">
        <BentoBoxTitle small>{t('Self-hosting')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="https://blueskydirectory.com/" className="py-4">
        <BentoBoxTitle small>{t('Showcase')}</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="https://docs.bsky.app/blog" className="py-4">
        <BentoBoxTitle small>{t('Blog')}</BentoBoxTitle>
      </BentoBox>
    </BentoGrid>
  )
}
