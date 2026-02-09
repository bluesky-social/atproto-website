import { Card, CardCTA, CardParagraph, CardTitle } from '../Card'
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
      <Card href="/guides/oauth-tutorial">
        <DotPatternContainer className="px-6 py-4" fade>
          <div className="flex items-center gap-4">
            <KeyIcon className="size-8 shrink-0 stroke-white" strokeWidth="0.6" />
            <CardTitle>Bring your own identity</CardTitle>
            <CardCTA className="ml-auto mt-0">LEARN MORE</CardCTA>
          </div>
        </DotPatternContainer>
      </Card>
    </div>
  )
}