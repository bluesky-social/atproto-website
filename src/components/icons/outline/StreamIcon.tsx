export function StreamIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  const strokeWidth = props.strokeWidth || '2.2'
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <path
        d="M3.3335 12.6666C5.47287 12.6666 7.57705 8.66663 9.66683 8.66663C11.7855 8.66663 13.8894 12.6666 16.0002 12.6666C18.0974 12.6666 20.2014 8.66663 22.3335 8.66663C24.4114 8.66663 26.516 12.6666 28.6668 12.6666M3.3335 23.3333C5.47287 23.3333 7.57705 19.3333 9.66683 19.3333C11.7855 19.3333 13.8894 23.3333 16.0002 23.3333C18.0974 23.3333 20.2014 19.3333 22.3335 19.3333C24.4114 19.3333 26.516 23.3333 28.6668 23.3333"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}
