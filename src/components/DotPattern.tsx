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
          <rect width="2" height="2" fill="#F0EBEB" />
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
  return <DotPattern className="absolute inset-0" width="100%" height="100%" />
}
