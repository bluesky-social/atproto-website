import { BentoBox, BentoBoxIcon, BentoBoxTitle, BentoGrid } from '../Bento'

export function BentoNav() {
  return (
    <BentoGrid wide>
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
  )
}
