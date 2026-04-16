import type { DetailedHTMLProps, HTMLAttributes } from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'scope-builder': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
      'permission-author': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}
