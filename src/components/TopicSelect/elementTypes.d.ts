import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'topic-select': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}
