import clsx from 'clsx'
import Link from 'next/link'
import { ButtonArrowIcon } from './Button'
import { OutlineIconEnum, Icon } from './icons/outline'

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

export function BentoGrid({ children }: React.PropsWithChildren<{}>) {
  return <div className="grid gap-4 lg:grid-cols-6">{children}</div>
}

export function BentoBox({
  className,
  href,
  wide,
  tall,
  horz,
  children,
}: React.PropsWithChildren<{
  className?: string
  href?: string
  wide?: boolean
  tall?: boolean
  horz?: boolean
}>) {
  return (
    <Link
      href={href || '#'}
      className={clsx(
        'relative block flex items-center justify-center gap-4 rounded-sm px-4 py-12 ring-1 ring-zinc-900/15 transition-all duration-150 hover:ring-zinc-900/30 dark:ring-zinc-100/7.5 dark:hover:shadow-black/5 dark:hover:ring-zinc-100/25',
        wide && 'lg:col-span-2',
        tall && 'lg:row-span-2',
        horz ? 'flex-row' : 'flex-col',
        className,
      )}
    >
      {children}
    </Link>
  )
}

export function BentoBoxIcon({
  className,
  small,
  big,
  icon,
}: {
  className?: string
  small?: boolean
  big?: boolean
  icon: OutlineIconEnum
}) {
  return (
    <div
      className={clsx(
        'fill-none stroke-current',
        className,
        small ? 'size-8' : big ? 'size-24' : 'size-12',
      )}
    >
      <Icon icon={icon} strokeWidth={big ? '0.5' : '0.9'} />
    </div>
  )
}

export function BentoBoxTitle({
  className,
  small,
  big,
  children,
}: React.PropsWithChildren<{
  className?: string
  small?: boolean
  big?: boolean
}>) {
  return (
    <div
      className={clsx(
        'text-center',
        small ? 'text-xl' : big ? 'text-4xl' : 'text-3xl',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BentoBoxParagraph({
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

export function BentoBoxCTA({
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
