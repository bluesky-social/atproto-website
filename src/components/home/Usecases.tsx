import { Card, CardCTA, CardParagraph, CardTitle } from '../Card'
import { CTAButton, CTAButtonTitle } from '../CTAButton'
import { DotPatternContainer } from '../DotPattern'
import { SparklesIcon } from '../icons/outline/SparklesIcon'
import { WindowIcon } from '../icons/outline/WindowIcon'
import { UserIcon } from '../icons/outline/UserIcon'
import { KeyIcon } from '../icons/outline/KeyIcon'

export function Usecases({ wide }: { wide?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex flex-col gap-4 ${wide ? 'md:flex-row' : 'xl:flex-row'}`}
      >
        <Card className="flex-1" href="/guides/statusphere-tutorial">
          <DotPatternContainer className="px-6 py-4" fade>
            <WindowIcon className="mb-6 mt-2 size-12" strokeWidth="0.6" />
            <CardTitle>Create an App</CardTitle>
            <CardParagraph>
              Tap into the shared Atmosphere network to create your next app.
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
        <Card className="flex-1" href="/guides/bot-tutorial">
          <DotPatternContainer className="px-6 py-4" fade>
            <UserIcon className="mb-6 mt-2 size-12" strokeWidth="0.6" />
            <CardTitle>Build an Agent</CardTitle>
            <CardParagraph>
              Listen to the firehose for mentions and reply to users
              automatically.
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
        <Card className="flex-1" href="/guides/custom-feed-tutorial">
          <DotPatternContainer className="px-6 py-4" fade>
            <SparklesIcon className="mb-6 mt-2 size-12" strokeWidth="0.6" />
            <CardTitle>Write an Algorithm</CardTitle>
            <CardParagraph>
              Use simple rules or advanced ML to create custom feeds.
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
      </div>
      <div className="md:hidden">
        <Card className="flex-1" href="/guides/oauth-tutorial">
          <DotPatternContainer className="px-6 py-4" fade>
            <KeyIcon
              className="mb-6 mt-2 size-12 stroke-white"
              strokeWidth="0.6"
            />
            <CardTitle>Login with user-owned identities</CardTitle>
            <CardParagraph>
              Usernames are just domains. We&apos;re @atproto.com!
            </CardParagraph>
            <CardCTA>LEARN MORE</CardCTA>
          </DotPatternContainer>
        </Card>
      </div>
      <div className="hidden md:block">
        <CTAButton href="/guides/oauth-tutorial">
          <KeyIcon className="size-8 shrink-0 stroke-white" strokeWidth="0.6" />
          <CTAButtonTitle title="Login with user-owned identities" subtitle="We're @atproto.com!" />
        </CTAButton>
      </div>
    </div>
  )
}
