import clsx from 'clsx'
import Link from 'next/link'
import { ButtonArrowIcon } from './Button'

/**
 * Example usage:

  <Card className="flex-1" href="/TODO">
    <DotPatternContainer className="px-6 py-4" fade>
      <CardTitle>Open public firehose</CardTitle>
      <CardParagraph>
        Tap into the network events with a single CLI command.
      </CardParagraph>
      <CardCTA>LEARN MORE</CardCTA>
    </DotPatternContainer>
  </Card>
*/

export function Card({
  className,
  href,
  children,
}: React.PropsWithChildren<{
  className?: string
  href?: string
}>) {
  return (
    <Link
      href={href || '#'}
      className={clsx(
        'not-prose relative block rounded-sm ring-1 ring-zinc-900/15 transition-shadow hover:ring-zinc-900/30 dark:ring-zinc-100/15 dark:hover:ring-zinc-100/25',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function CardTitle({
  className,
  children,
}: React.PropsWithChildren<{
  className?: string
}>) {
  return (
    <div className={clsx('text-2xl font-medium leading-normal', className)}>
      {children}
    </div>
  )
}

export function CardParagraph({
  className,
  children,
}: React.PropsWithChildren<{
  className?: string
}>) {
  return (
    <div className={clsx('text-zinc-700 dark:text-zinc-400', className)}>
      {children}
    </div>
  )
}

export function CardCTA({
  className,
  children,
}: React.PropsWithChildren<{
  className?: string
}>) {
  return (
    <div className={clsx('mt-8 flex items-center font-medium', className)}>
      <div>{children}</div>
      <ButtonArrowIcon className="relative -mr-1 h-6 w-6" />
    </div>
  )
}
