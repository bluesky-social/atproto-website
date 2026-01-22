import { GlobeAnimation } from '@/components/home/GlobeAnimation'
import { Button, ButtonArrowIcon } from '@/components/Button'
import clsx from 'clsx'

import { Card, CardCTA, CardParagraph, CardTitle } from '@/components/Card'
import { DotPatternContainer } from '@/components/DotPattern'
import { ExplainerUnit } from '@/components/home/ExplainerUnit'
import { Firehose } from '@/components/home/Firehose'
import {
  BentoBox,
  BentoBoxIcon,
  BentoBoxTitle,
  BentoGrid,
} from '@/components/Bento'

export default async function HomePage({ params }: any) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-8 lg:max-w-7xl">
      <div className="flex flex-col-reverse items-center py-12 xl:flex-row">
        <div className="flex flex-col gap-4 pb-8 sm:text-center xl:flex-1 xl:pb-0 xl:text-left">
          <h1 className="sm:text-5px font-mono text-4xl uppercase leading-[1.1] md:text-7xl md:tracking-[-4px]">
            AT PROTOCOL
          </h1>
          <div className="hyphens-none font-mono text-xl text-zinc-700 xl:pr-40 dark:text-zinc-400">
            The open social network for high&#8209;scale interoperation.
          </div>
          <div className="py-4 sm:py-12">
            <Button
              variant="primary"
              arrow="right"
              font="mono"
              size="xxlarge"
              href="/docs"
            >
              GET STARTED
            </Button>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-0">
            <Stat value="40M+" desc="Users online" first />
            <Stat value="1.961B+" desc="Totally normal posts" />
            <Stat value="100%" desc="Open source" />
          </div>
        </div>
        <div className="py-16 sm:py-8 xl:flex-1 xl:py-0">
          <GlobeAnimation lines={30} />
        </div>
      </div>
      <div className="flex gap-4">
        <Card className="flex-1" href="/TODO">
          <DotPatternContainer className="px-6 py-4" fade>
            <CardTitle>Something</CardTitle>
            <CardParagraph>
              Something something Something something Something something
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
        <Card className="flex-1" href="/TODO">
          <DotPatternContainer className="px-6 py-4" fade>
            <CardTitle>Something</CardTitle>
            <CardParagraph>
              Something something Something something Something something
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
        <Card className="flex-1" href="/TODO">
          <DotPatternContainer className="px-6 py-4" fade>
            <CardTitle>Something</CardTitle>
            <CardParagraph>
              Something something Something something Something something
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
      </div>
      <ExplainerUnit />
      <Firehose />
      <BentoGrid>
        <BentoBox href="/TODO" wide tall>
          <BentoBoxIcon icon="academic-cap" big />
          <BentoBoxTitle big>Tutorials</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO">
          <BentoBoxIcon icon="key" small />
          <BentoBoxTitle small>Auth</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO">
          <BentoBoxIcon icon="database" small />
          <BentoBoxTitle small>Read / Write</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO">
          <BentoBoxIcon icon="stream" small />
          <BentoBoxTitle small>Sync</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO">
          <BentoBoxIcon icon="puzzle-piece" small />
          <BentoBoxTitle small>Lexicon</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO">
          <BentoBoxIcon icon="media" small />
          <BentoBoxTitle small>Media</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO">
          <BentoBoxIcon icon="flag" small />
          <BentoBoxTitle small>Moderation</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" wide horz>
          <BentoBoxIcon icon="cube" />
          <BentoBoxTitle>SDKs</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-4">
          <BentoBoxTitle small>Cookbook</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-4">
          <BentoBoxTitle small>Specs</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-4">
          <BentoBoxTitle small>FAQ</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-4">
          <BentoBoxTitle small>Self-hosting</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-4">
          <BentoBoxTitle small>Showcase</BentoBoxTitle>
        </BentoBox>
        <BentoBox href="/TODO" className="py-4">
          <BentoBoxTitle small>Blog</BentoBoxTitle>
        </BentoBox>
      </BentoGrid>
    </div>
  )
}

function Stat({
  value,
  desc,
  first,
}: {
  value: string
  desc: string
  first?: boolean
}) {
  return (
    <div
      className={clsx(
        'flex-1 border-zinc-300 py-1 sm:px-4 xl:flex-none xl:pr-12 dark:border-zinc-700',
        first ? 'xl:border-l' : 'sm:border-l',
      )}
    >
      <div className="font-mono text-2xl font-bold">{value}</div>
      <div className="text-lg">{desc}</div>
    </div>
  )
}
