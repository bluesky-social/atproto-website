import clsx from 'clsx'
import Link from 'next/link'
import { ButtonArrowIcon } from './Button'
import { DotPattern } from './DotPattern'

/**
 * Example usage:

  <CTAButton className="flex-1" href="/TODO">
    <DotPatternContainer className="px-6 py-4" fade>
      <CTAButtonTitle>Open public firehose</CTAButtonTitle>
    </DotPatternContainer>
  </CTAButton>
*/

export function CTAButton({
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
        'not-prose relative flex items-center gap-4 rounded-sm px-4 py-4 ring-1 ring-zinc-900/15 transition-shadow hover:ring-zinc-900/30 dark:ring-zinc-100/15 dark:hover:ring-zinc-100/25',
        className,
      )}
    >
      <DotPattern className="h-8 flex-1 fill-slate-200 dark:fill-slate-700" />
      {children}
      <DotPattern className="h-8 flex-1 fill-slate-200 dark:fill-slate-700" />
    </Link>
  )
}

export function CTAButtonTitle({
  className,
  title,
  subtitle,
}: {
  className?: string
  title?: string
  subtitle?: string
}) {
  return (
    <div className={clsx("flex flex-row items-baseline gap-2", className)}>
      <div className={clsx('text-xl leading-normal')}>{title}</div>
      <div className="text-md text-zinc-700 dark:text-zinc-400">{subtitle}</div>
    </div>
  )
}
