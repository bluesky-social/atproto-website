import { Usecases } from '@/components/home/Usecases'
import {
  BentoBox,
  BentoBoxIcon,
  BentoBoxTitle,
  BentoGrid,
} from '@/components/Bento'

export const header = {
  title: 'We can just build things',
  description:
    'Create high-scale social applications that are interoperable by default.',
  primaryCTA: {
    label: 'Intro',
    href: '/TODO',
  },
  secondaryCTA: {
    label: 'SDKs',
    href: '/sdks',
  },
}

export default function () {
  return (
    <div className="flex max-w-6xl flex-col gap-4 px-16 pb-16 pt-16">
      <Usecases />
      <BentoGrid>
        <BentoBox href="/TODO" className="py-8">
          <BentoBoxIcon icon="key" small />
          <BentoBoxTitle small>Auth</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-8">
          <BentoBoxIcon icon="database" small />
          <BentoBoxTitle small>Read / Write</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-8">
          <BentoBoxIcon icon="stream" small />
          <BentoBoxTitle small>Sync</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-8">
          <BentoBoxIcon icon="puzzle-piece" small />
          <BentoBoxTitle small>Lexicon</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-8">
          <BentoBoxIcon icon="media" small />
          <BentoBoxTitle small>Media</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-8">
          <BentoBoxIcon icon="flag" small />
          <BentoBoxTitle small>Moderation</BentoBoxTitle>
        </BentoBox>
      </BentoGrid>
    </div>
  )
}
