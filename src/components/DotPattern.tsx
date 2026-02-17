import clsx from 'clsx'
import { useId } from 'react'

export function DotPattern(props: React.ComponentPropsWithoutRef<'svg'>) {
  let patternId = useId()

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          id={patternId}
          width={10}
          height={10}
          patternUnits="userSpaceOnUse"
          x={0}
          y={0}
        >
          <rect width="2" height="2" fill="current" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />
    </svg>
  )
}

export function DotPatternBackground() {
  return (
    <DotPattern
      className="absolute inset-0 fill-slate-200 dark:fill-slate-700"
      width="100%"
      height="100%"
    />
  )
}

export function DotPatternContainer({
  className,
  fade,
  children,
}: React.PropsWithChildren<{ className?: string; fade?: boolean }>) {
  return (
    <div className={clsx('relative', className)}>
      <DotPatternBackground />
      {fade && (
        <div className="absolute inset-0 bg-gradient-to-b from-white to-white/0 dark:from-zinc-900 dark:to-zinc-900/0" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
