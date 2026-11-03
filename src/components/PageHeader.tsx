import { DotPatternBackground } from './DotPattern'
import { Button } from './Button'
import clsx from 'clsx'
import knownAuthors from '@/lib/authors.json'

export interface PageHeaderProps {
  title: string
  description?: string
  date?: string
  author?: string
  primaryCTA?: CtaProps
  secondaryCTA?: CtaProps
  fullwidth?: boolean
}

interface CtaProps {
  label: string
  href: string
}

export function PageHeader({
  title,
  description,
  date,
  author,
  primaryCTA,
  secondaryCTA,
  fullwidth,
}: PageHeaderProps) {
  const authorDid = author
    ? (knownAuthors as Record<string, string>)[author]
    : undefined
  return (
    <div className="relative">
      <DotPatternBackground />
      <div
        className={clsx(
          'relative z-10 px-4 pb-12 pt-12',
          'md:px-16 md:pb-16 md:pt-24',
          !fullwidth && 'max-w-6xl',
        )}
      >
        <h1 className="m-0 font-mono text-4xl font-medium md:text-5xl">
          {title}
        </h1>
        {description && (
          <div className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            {description}
          </div>
        )}
        {date && (
          <div className="mt-4 font-mono text-lg text-zinc-600 dark:text-zinc-400">
            {date}
          </div>
        )}
        {author && (
          <div className="mt-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            By{' '}
            {authorDid ? (
              <a
                href={`https://bsky.app/profile/${authorDid}`}
                className="underline hover:text-zinc-900 dark:hover:text-zinc-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                {author}
              </a>
            ) : (
              author
            )}
          </div>
        )}
        {(primaryCTA || secondaryCTA) && (
          <div className="mt-4 flex gap-2 max-md:w-full">
            {primaryCTA && (
              <Button
                href={primaryCTA.href}
                variant="primary"
                size="large"
                className="max-md:flex-1"
              >
                {primaryCTA.label}
              </Button>
            )}
            {secondaryCTA && (
              <Button
                href={secondaryCTA.href}
                variant="outline"
                size="large"
                className="max-md:flex-1"
              >
                {secondaryCTA.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
