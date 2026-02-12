import { BentoBox, BentoBoxIcon, BentoBoxTitle, BentoGrid } from '../Bento'

export function BentoNav() {
  return (
    <BentoGrid wide>
      <BentoBox href="/guides/tutorials" wide tall>
        <BentoBoxIcon icon="academic-cap" big />
        <BentoBoxTitle big>Tutorials</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/auth">
        <BentoBoxIcon icon="key" small />
        <BentoBoxTitle small>Auth</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/reads-and-writes">
        <BentoBoxIcon icon="database" small />
        <BentoBoxTitle small>Read / Write</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/sync">
        <BentoBoxIcon icon="stream" small />
        <BentoBoxTitle small>Sync</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/lexicon">
        <BentoBoxIcon icon="puzzle-piece" small />
        <BentoBoxTitle small>Lexicon</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/images-and-video">
        <BentoBoxIcon icon="media" small />
        <BentoBoxTitle small>Media</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/moderation">
        <BentoBoxIcon icon="flag" small />
        <BentoBoxTitle small>Moderation</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/sdks" wide horz>
        <BentoBoxIcon icon="cube" />
        <BentoBoxTitle>SDKs</BentoBoxTitle>
      </BentoBox>
      <BentoBox
        href="https://github.com/bluesky-social/cookbook/"
        className="py-4"
      >
        <BentoBoxTitle small>Cookbook</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/specs/atp" className="py-4">
        <BentoBoxTitle small>Specs</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/faq" className="py-4">
        <BentoBoxTitle small>FAQ</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="/guides/self-hosting" className="py-4">
        <BentoBoxTitle small>Self-hosting</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="https://blueskydirectory.com/" className="py-4">
        <BentoBoxTitle small>Showcase</BentoBoxTitle>
      </BentoBox>
      <BentoBox href="https://docs.bsky.app/blog" className="py-4">
        <BentoBoxTitle small>Blog</BentoBoxTitle>
      </BentoBox>
    </BentoGrid>
  )
}
