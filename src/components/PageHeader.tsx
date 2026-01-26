import { DotPatternBackground } from './DotPattern'
import { Button } from './Button'
import clsx from 'clsx'

export interface PageHeaderProps {
  title: string
  description?: string
  date?: string
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
  primaryCTA,
  secondaryCTA,
  fullwidth,
}: PageHeaderProps) {
  return (
    <div className="relative">
      <DotPatternBackground />
      <div
        className={clsx(
          'relative z-10 px-8 pb-12 pt-12',
          'md:px-16 md:pb-16 md:pt-24',
          !fullwidth && 'max-w-6xl',
        )}
      >
        <h1 className="m-0 font-mono text-3xl font-medium md:text-5xl">
          {title}
        </h1>
        <div className="mt-4 flex flex-col justify-between max-md:gap-4 md:flex-row md:items-center">
          <div>
            {description && (
              <div className="text-lg text-slate-600 dark:text-slate-400">
                {description}
              </div>
            )}
          </div>
          {date || primaryCTA || secondaryCTA ? (
            <div className="flex gap-2 max-md:w-full">
              {date && (
                <span className="text-lg text-slate-600 dark:text-slate-400">
                  {date}
                </span>
              )}
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
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  )
}
