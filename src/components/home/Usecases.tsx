import { Card, CardCTA, CardParagraph, CardTitle } from '../Card'
import { DotPatternContainer } from '../DotPattern'
import { SparklesIcon } from '../icons/outline/SparklesIcon'
import { WindowIcon } from '../icons/outline/WindowIcon'
import { UserIcon } from '../icons/outline/UserIcon'

export function Usecases({ wide }: { wide?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-4 ${wide ? 'md:flex-row' : 'xl:flex-row'}`}
    >
      <Card className="flex-1" href="/guides/statusphere-tutorial">
        <DotPatternContainer className="px-6 py-4" fade>
          <WindowIcon className="mb-6 mt-2 size-12" strokeWidth="0.6" />
          <CardTitle>Create an App</CardTitle>
          <CardParagraph>
            Write social applications on the shared Atmosphere network.
          </CardParagraph>
          <CardCTA>LEARN MORE</CardCTA>
        </DotPatternContainer>
      </Card>
      <Card className="flex-1" href="/guides/bot-tutorial">
        <DotPatternContainer className="px-6 py-4" fade>
          <UserIcon className="mb-6 mt-2 size-12" strokeWidth="0.6" />
          <CardTitle>Build a Bot</CardTitle>
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
  )
}
